package com.example.fanpagebackend.modules.post.service.impl;

import com.example.fanpagebackend.common.FriendshipStatus;
import com.example.fanpagebackend.common.MediaType;
import com.example.fanpagebackend.common.PageResponse;
import com.example.fanpagebackend.common.PostStatus;
import com.example.fanpagebackend.modules.post.dto.request.CreatePostRequest;
import com.example.fanpagebackend.modules.post.dto.request.UpdatePostRequest;
import com.example.fanpagebackend.modules.post.dto.response.PostResponse;
import com.example.fanpagebackend.modules.comment.entity.Comment;
import com.example.fanpagebackend.modules.post.entity.Post;
import com.example.fanpagebackend.modules.post.entity.PostMedia;
import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.exception.BadRequestException;
import com.example.fanpagebackend.exception.ForbiddenException;
import com.example.fanpagebackend.exception.NotFoundException;
import com.example.fanpagebackend.modules.post.mapper.PostMapper;
import com.example.fanpagebackend.modules.comment.repository.CommentRepository;
import com.example.fanpagebackend.modules.friend.repository.FriendRequestRepository;
import com.example.fanpagebackend.modules.like.repository.PostLikeRepository;
import com.example.fanpagebackend.modules.like.entity.PostLike;
import com.example.fanpagebackend.modules.like.entity.ReactionType;
import com.example.fanpagebackend.modules.post.repository.PostRepository;
import com.example.fanpagebackend.modules.file.service.FileStorageService;
import com.example.fanpagebackend.modules.post.service.PostService;
import com.example.fanpagebackend.modules.post.service.ProfanityFilterService;
import com.example.fanpagebackend.modules.user.service.UserService;
import com.example.fanpagebackend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostMapper postMapper;
    private final FriendRequestRepository friendRequestRepository;
    private final SecurityUtil securityUtil;
    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final ProfanityFilterService profanityFilterService; // Nhúng bộ lọc bảo vệ tự động từ cấm

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostResponse> getFeed(int page, int size) {
        User currentUser = securityUtil.getCurrentUser();
        int safeSize = Math.max(size, 4);

        List<Long> friendIds = friendRequestRepository.findAcceptedByUser(currentUser, FriendshipStatus.ACCEPTED)
                .stream()
                .map(item -> item.getRequester().getId().equals(currentUser.getId())
                        ? item.getAddressee().getId()
                        : item.getRequester().getId())
                .toList();

        if (friendIds.isEmpty()) {
            Pageable pageable = PageRequest.of(page, size);
            Page<Post> result = postRepository.findAllByOrderByCreatedAtDesc(pageable);
            return mapPage(result, currentUser, true);
        }

        int friendTake = safeSize - Math.max(1, safeSize / 4);
        int strangerTake = Math.max(1, safeSize / 4);

        Page<Post> friendPosts = postRepository.findByAuthorIdsOrderByCreatedAtDesc(
                friendIds,
                PageRequest.of(page, friendTake)
        );

        List<Long> excludedUserIds = new ArrayList<>(friendIds);
        excludedUserIds.add(currentUser.getId());
        Page<Post> strangerPosts = postRepository.findStrangerPosts(
                excludedUserIds,
                PageRequest.of(page, strangerTake)
        );

        List<Post> mixedPosts = mixFriendAndStrangerPosts(friendPosts.getContent(), strangerPosts.getContent());
        List<PostResponse> items = mixedPosts.stream()
                .limit(size)
                .map(post -> mapSinglePost(post, currentUser, true))
                .toList();

        boolean hasMore = friendPosts.hasNext() || strangerPosts.hasNext();
        long totalItems = friendPosts.getTotalElements() + strangerPosts.getTotalElements();
        int totalPages = (int) Math.ceil(totalItems / (double) Math.max(size, 1));

        return PageResponse.<PostResponse>builder()
                .items(items)
                .page(page)
                .size(size)
                .totalItems(totalItems)
                .totalPages(totalPages)
                .hasMore(hasMore)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse getPostDetail(Long postId) {
        Post post = getPostEntity(postId);
        User currentUser = securityUtil.getCurrentUser();
        List<Comment> comments = commentRepository.findByPostOrderByCreatedAtAsc(post);
        long likesCount = postLikeRepository.countByPost(post);
        PostLike currentReaction = postLikeRepository.findByPostAndUser(post, currentUser).orElse(null);
        boolean liked = currentReaction != null;
        String currentReactionType = currentReaction != null
                ? (currentReaction.getReactionType() != null ? currentReaction.getReactionType().name() : ReactionType.LIKE.name())
                : null;
        return postMapper.toPostResponse(post, comments, likesCount, buildReactionCounts(post), currentReactionType, liked, true, currentUser.getId());
    }

    @Override
    @Transactional
    public PostResponse createPost(CreatePostRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        validatePostData(request.getContent(), request.getImageUrls(), request.getVideoUrls());

        // CHẶN BÀI VIẾT CHỨA TỪ CẤM (Dạng JSON API)
        if (profanityFilterService.checkTextViolation(request.getContent())) {
            throw new BadRequestException("Bài viết của bạn chứa ngôn từ không phù hợp với tiêu chuẩn cộng đồng và đã bị hệ thống tự động chặn.");
        }

        Post post = Post.builder()
                .author(currentUser)
                .content(normalizeContent(request.getContent()))
                .anonymous(request.isAnonymous())
                .status(PostStatus.ACTIVE)
                .build();

        Post savedPost = postRepository.save(post);
        addMediaListFromUrls(savedPost, request);
        Post finalPost = postRepository.save(savedPost);

        return getPostDetail(finalPost.getId());
    }

    @Override
    @Transactional
    public PostResponse createPostMultipart(
            String content,
            Boolean anonymous,
            List<MultipartFile> images,
            List<MultipartFile> videos
    ) {
        User currentUser = securityUtil.getCurrentUser();
        validatePostData(content, images, videos);
        validateMediaCounts(images, videos);

        // CHẶN BÀI VIẾT CHỨA TỪ CẤM (Dạng Form Data Multipart)
        if (profanityFilterService.checkTextViolation(content)) {
            throw new BadRequestException("Bài viết của bạn chứa ngôn từ không phù hợp với tiêu chuẩn cộng đồng và đã bị hệ thống tự động chặn.");
        }

        Post post = Post.builder()
                .author(currentUser)
                .content(normalizeContent(content))
                .anonymous(Boolean.TRUE.equals(anonymous))
                .status(PostStatus.ACTIVE)
                .build();

        Post savedPost = postRepository.save(post);
        addMediaListFromFiles(savedPost, images, videos);
        Post finalPost = postRepository.save(savedPost);

        return getPostDetail(finalPost.getId());
    }

    @Override
    @Transactional
    public PostResponse updateMyPost(Long postId, UpdatePostRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        Post post = getPostEntity(postId);

        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Bạn không có quyền chỉnh sửa bài viết này");
        }

        // CHẶN CẬP NHẬT BÀI VIẾT CHỨA TỪ CẤM
        if (profanityFilterService.checkTextViolation(request.getContent())) {
            throw new BadRequestException("Không thể cập nhật! Nội dung sửa đổi chứa ngôn từ không phù hợp quy định.");
        }

        String normalizedContent = normalizeContent(request.getContent());
        boolean hasContent = !normalizedContent.isBlank();
        boolean hasMedia = post.getMediaList() != null && !post.getMediaList().isEmpty();

        if (!hasContent && !hasMedia) {
            throw new BadRequestException("Bài viết phải có nội dung hoặc ít nhất một ảnh/video");
        }

        post.setContent(normalizedContent);
        post.setAnonymous(request.isAnonymous());

        Post savedPost = postRepository.save(post);
        return mapSinglePost(savedPost, currentUser, true);
    }

    @Override
    @Transactional
    public void deleteMyPost(Long postId) {
        User currentUser = securityUtil.getCurrentUser();
        Post post = getPostEntity(postId);

        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Bạn không có quyền xóa bài viết này");
        }

        postRepository.delete(post);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostResponse> getMyPosts(int page, int size) {
        User currentUser = securityUtil.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> result = postRepository.findByAuthorOrderByCreatedAtDesc(currentUser, pageable);
        return mapPage(result, currentUser, true);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostResponse> getPublicPostsByUser(Long userId, int page, int size) {
        User user = userService.getUserEntityById(userId);
        User currentUser = securityUtil.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> result = postRepository.findByAuthorAndAnonymousFalseOrderByCreatedAtDesc(user, pageable);
        return mapPage(result, currentUser, true);
    }

    public Post getPostEntity(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bài viết"));
    }


    private List<Post> mixFriendAndStrangerPosts(List<Post> friendPosts, List<Post> strangerPosts) {
        List<Post> mixedPosts = new ArrayList<>();
        int friendIndex = 0;
        int strangerIndex = 0;

        while (friendIndex < friendPosts.size() || strangerIndex < strangerPosts.size()) {
            int count = 0;
            while (count < 3 && friendIndex < friendPosts.size()) {
                mixedPosts.add(friendPosts.get(friendIndex++));
                count++;
            }

            if (strangerIndex < strangerPosts.size()) {
                mixedPosts.add(strangerPosts.get(strangerIndex++));
            }

            if (count == 0 && strangerIndex >= strangerPosts.size()) {
                break;
            }
        }

        return mixedPosts;
    }

    private PageResponse<PostResponse> mapPage(Page<Post> pageData, User currentUser, boolean includeComments) {
        List<PostResponse> items = pageData.getContent()
                .stream()
                .map(post -> mapSinglePost(post, currentUser, includeComments))
                .toList();

        return PageResponse.<PostResponse>builder()
                .items(items)
                .page(pageData.getNumber())
                .size(pageData.getSize())
                .totalItems(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .hasMore(pageData.getNumber() + 1 < pageData.getTotalPages())
                .build();
    }

    private PostResponse mapSinglePost(Post post, User currentUser, boolean includeComments) {
        List<Comment> comments = commentRepository.findByPostOrderByCreatedAtAsc(post);
        long likesCount = postLikeRepository.countByPost(post);
        Long currentUserId = currentUser != null ? currentUser.getId() : null;
        PostLike currentReaction = currentUser != null ? postLikeRepository.findByPostAndUser(post, currentUser).orElse(null) : null;
        boolean liked = currentReaction != null;
        String currentReactionType = currentReaction != null
                ? (currentReaction.getReactionType() != null ? currentReaction.getReactionType().name() : ReactionType.LIKE.name())
                : null;

        return postMapper.toPostResponse(post, comments, likesCount, buildReactionCounts(post), currentReactionType, liked, includeComments, currentUserId);
    }

    private Map<String, Long> buildReactionCounts(Post post) {
        Map<String, Long> result = new LinkedHashMap<>();
        Arrays.stream(ReactionType.values())
                .forEach(type -> result.put(type.name(), 0L));

        postLikeRepository.findByPost(post).forEach(item -> {
            ReactionType type = item.getReactionType() != null ? item.getReactionType() : ReactionType.LIKE;
            result.put(type.name(), result.get(type.name()) + 1);
        });

        return result;
    }

    private void addMediaListFromUrls(Post post, CreatePostRequest request) {
        List<PostMedia> mediaList = new ArrayList<>();
        int sortOrder = 1;

        for (String imageUrl : safeList(request.getImageUrls())) {
            if (imageUrl != null && !imageUrl.isBlank()) {
                mediaList.add(PostMedia.builder()
                        .post(post)
                        .url(imageUrl.trim())
                        .type(MediaType.IMAGE)
                        .sortOrder(sortOrder++)
                        .build());
            }
        }

        for (String videoUrl : safeList(request.getVideoUrls())) {
            if (videoUrl != null && !videoUrl.isBlank()) {
                mediaList.add(PostMedia.builder()
                        .post(post)
                        .url(videoUrl.trim())
                        .type(MediaType.VIDEO)
                        .sortOrder(sortOrder++)
                        .build());
            }
        }

        post.setMediaList(mediaList);
    }

    private void addMediaListFromFiles(Post post, List<MultipartFile> images, List<MultipartFile> videos) {
        List<PostMedia> mediaList = new ArrayList<>();
        int sortOrder = 1;

        for (MultipartFile image : safeList(images)) {
            if (image != null && !image.isEmpty()) {
                String imageUrl = fileStorageService.storePostMedia(image, "images");
                mediaList.add(PostMedia.builder()
                        .post(post)
                        .url(imageUrl)
                        .type(MediaType.IMAGE)
                        .sortOrder(sortOrder++)
                        .build());
            }
        }

        for (MultipartFile video : safeList(videos)) {
            if (video != null && !video.isEmpty()) {
                String videoUrl = fileStorageService.storePostMedia(video, "videos");
                mediaList.add(PostMedia.builder()
                        .post(post)
                        .url(videoUrl)
                        .type(MediaType.VIDEO)
                        .sortOrder(sortOrder++)
                        .build());
            }
        }

        post.setMediaList(mediaList);
    }

    private void validatePostData(String content, List<?> images, List<?> videos) {
        boolean hasContent = content != null && !content.trim().isEmpty();
        boolean hasImages = images != null && !images.isEmpty();
        boolean hasVideos = videos != null && !videos.isEmpty();

        if (!hasContent && !hasImages && !hasVideos) {
            throw new BadRequestException("Bài viết phải có nội dung hoặc ít nhất một ảnh/video");
        }
    }

    private void validateMediaCounts(List<MultipartFile> images, List<MultipartFile> videos) {
        if (images != null && images.size() > 6) {
            throw new BadRequestException("Bạn chỉ có thể tải tối đa 6 ảnh cho một bài viết");
        }

        if (videos != null && videos.size() > 2) {
            throw new BadRequestException("Bạn chỉ có thể tải tối đa 2 video cho một bài viết");
        }
    }

    private String normalizeContent(String content) {
        return content == null ? "" : content.trim();
    }

    private <T> List<T> safeList(List<T> items) {
        return items == null ? List.of() : items;
    }
}