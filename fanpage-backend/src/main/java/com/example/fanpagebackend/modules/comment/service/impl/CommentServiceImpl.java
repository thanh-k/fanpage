package com.example.fanpagebackend.modules.comment.service.impl;

import com.example.fanpagebackend.modules.comment.dto.request.AddCommentRequest;
import com.example.fanpagebackend.modules.comment.dto.response.CommentResponse;
import com.example.fanpagebackend.modules.comment.entity.Comment;
import com.example.fanpagebackend.modules.post.entity.Post;
import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.modules.post.mapper.PostMapper;
import com.example.fanpagebackend.modules.comment.repository.CommentRepository;
import com.example.fanpagebackend.modules.notification.constant.NotificationType;
import com.example.fanpagebackend.modules.comment.service.CommentService;
import com.example.fanpagebackend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import com.example.fanpagebackend.modules.post.service.impl.PostServiceImpl;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostServiceImpl postService;
    private final SecurityUtil securityUtil;
    private final com.example.fanpagebackend.modules.notification.service.NotificationService notificationService;
    private final PostMapper postMapper;

    @Override
    public List<CommentResponse> getCommentsByPost(Long postId) {
        Post post = postService.getPostEntity(postId);
        return commentRepository.findByPostOrderByCreatedAtAsc(post)
                .stream()
                .map(postMapper::toCommentResponse)
                .toList();
    }

    @Override
    @Transactional
    public CommentResponse addComment(Long postId, AddCommentRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        Post post = postService.getPostEntity(postId);

        Comment comment = Comment.builder()
                .post(post)
                .author(currentUser)
                .content(request.getContent().trim())
                .build();

        Comment savedComment = commentRepository.save(comment);
        if(!post.getAuthor().getId().equals(currentUser.getId())) notificationService.createAndSend(
                    post.getAuthor().getId(),
                    currentUser.getId(),
                    currentUser.getFullName(),
                    NotificationType.POST_COMMENT,
                    post.getId(),
                    currentUser.getFullName() + " đã bình luận bài viết của bạn",
                    "/posts/" + post.getId()
            );
        return postMapper.toCommentResponse(savedComment);
    }
}
