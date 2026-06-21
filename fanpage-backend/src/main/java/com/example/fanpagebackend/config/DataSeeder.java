package com.example.fanpagebackend.config;

import com.example.fanpagebackend.common.MediaType;
import com.example.fanpagebackend.common.PostStatus;
import com.example.fanpagebackend.common.Role;
import com.example.fanpagebackend.modules.user.entity.*;
import com.example.fanpagebackend.modules.post.entity.*;
import com.example.fanpagebackend.modules.comment.entity.*;
import com.example.fanpagebackend.modules.like.entity.*;
import com.example.fanpagebackend.modules.friend.entity.*;
import com.example.fanpagebackend.modules.admin.entity.*;
import com.example.fanpagebackend.modules.report.entity.*;
import com.example.fanpagebackend.modules.auth.entity.*;
import com.example.fanpagebackend.modules.chat.entity.*;
import com.example.fanpagebackend.modules.user.repository.*;
import com.example.fanpagebackend.modules.post.repository.*;
import com.example.fanpagebackend.modules.comment.repository.*;
import com.example.fanpagebackend.modules.like.repository.*;
import com.example.fanpagebackend.modules.friend.repository.*;
import com.example.fanpagebackend.modules.admin.repository.*;
import com.example.fanpagebackend.modules.report.repository.*;
import com.example.fanpagebackend.modules.auth.repository.*;
import com.example.fanpagebackend.modules.chat.repository.*;
import com.example.fanpagebackend.modules.chat.repository.mongo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import com.example.fanpagebackend.modules.comment.entity.Comment;
import com.example.fanpagebackend.modules.like.entity.PostLike;
import com.example.fanpagebackend.modules.post.entity.Post;
import com.example.fanpagebackend.modules.post.entity.PostMedia;
import com.example.fanpagebackend.modules.user.entity.User;
import com.example.fanpagebackend.modules.comment.repository.CommentRepository;
import com.example.fanpagebackend.modules.like.repository.PostLikeRepository;
import com.example.fanpagebackend.modules.post.repository.PostRepository;
import com.example.fanpagebackend.modules.user.repository.UserRepository;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedData(
            UserRepository userRepository,
            PostRepository postRepository,
            CommentRepository commentRepository,
            PostLikeRepository postLikeRepository
    ) {
        return args -> {
            ensureDefaultSuperAdmin(userRepository);

            if (userRepository.count() > 1) {
                return;
            }

            User user1 = userRepository.save(User.builder()
                    .username("nguyenvana")
                    .password(passwordEncoder.encode("123456"))
                    .fullName("Nguyễn Văn A")
                    .email("nguyenvana@example.com")
                    .avatar("https://i.pravatar.cc/150?u=nguyenvana")
                    .bio("Mình thích chia sẻ góc nhìn về công nghệ và cuộc sống.")
                    .location("Thủ Đức, TP.HCM")
                    .role(Role.USER)
                    .emailVerified(true)
                    .joinedAt(LocalDateTime.now().minusMonths(8))
                    .build());

            User user2 = userRepository.save(User.builder()
                    .username("tranthibinh")
                    .password(passwordEncoder.encode("123456"))
                    .fullName("Trần Thị Bình")
                    .email("tranthibinh@example.com")
                    .avatar("https://i.pravatar.cc/150?u=tranthibinh")
                    .bio("Yêu thích thiết kế giao diện sáng màu và tối ưu trải nghiệm người dùng.")
                    .location("Quận 7, TP.HCM")
                    .role(Role.USER)
                    .emailVerified(true)
                    .joinedAt(LocalDateTime.now().minusMonths(5))
                    .build());

            User user3 = userRepository.save(User.builder()
                    .username("phamquanghuy")
                    .password(passwordEncoder.encode("123456"))
                    .fullName("Phạm Quang Huy")
                    .email("phamquanghuy@example.com")
                    .avatar("https://i.pravatar.cc/150?u=phamquanghuy")
                    .bio("Thường đăng bài về React, Java backend và học tập.")
                    .location("Bình Thạnh, TP.HCM")
                    .role(Role.USER)
                    .emailVerified(true)
                    .joinedAt(LocalDateTime.now().minusMonths(3))
                    .build());

            Post post1 = postRepository.save(Post.builder()
                    .author(user1)
                    .content("Hôm nay mình vừa hoàn thiện giao diện fanpage mini với tông màu sáng hơn, dễ nhìn hơn.")
                    .anonymous(false)
                    .status(PostStatus.ACTIVE)
                    .build());

            Post post2 = postRepository.save(Post.builder()
                    .author(user2)
                    .content("Có ai từng thấy việc tách services riêng ở frontend giúp thay API thật dễ hơn rất nhiều không?")
                    .anonymous(true)
                    .status(PostStatus.ACTIVE)
                    .build());

            Post post3 = postRepository.save(Post.builder()
                    .author(user3)
                    .content("Mình thích kiểu feed tự động tải thêm khi cuộn gần cuối hơn là bấm nút tải thêm.")
                    .anonymous(false)
                    .status(PostStatus.ACTIVE)
                    .build());

            post1.setMediaList(List.of(
                    PostMedia.builder()
                            .post(post1)
                            .url("https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop")
                            .type(MediaType.IMAGE)
                            .sortOrder(1)
                            .build(),
                    PostMedia.builder()
                            .post(post1)
                            .url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop")
                            .type(MediaType.IMAGE)
                            .sortOrder(2)
                            .build()
            ));

            post2.setMediaList(List.of(
                    PostMedia.builder()
                            .post(post2)
                            .url("https://www.w3schools.com/html/mov_bbb.mp4")
                            .type(MediaType.VIDEO)
                            .sortOrder(1)
                            .build()
            ));

            post3.setMediaList(List.of(
                    PostMedia.builder()
                            .post(post3)
                            .url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop")
                            .type(MediaType.IMAGE)
                            .sortOrder(1)
                            .build()
            ));

            postRepository.saveAll(List.of(post1, post2, post3));

            commentRepository.save(Comment.builder()
                    .post(post1)
                    .author(user2)
                    .content("Màu sáng nhìn thân thiện hơn thật.")
                    .build());

            commentRepository.save(Comment.builder()
                    .post(post1)
                    .author(user3)
                    .content("Phần card bo góc đẹp và dễ demo nữa.")
                    .build());

            commentRepository.save(Comment.builder()
                    .post(post3)
                    .author(user1)
                    .content("Mình cũng thấy cách này mượt hơn khi feed dài.")
                    .build());

            postLikeRepository.save(PostLike.builder().post(post1).user(user2).build());
            postLikeRepository.save(PostLike.builder().post(post1).user(user3).build());
            postLikeRepository.save(PostLike.builder().post(post3).user(user1).build());
        };
    }

    private void ensureDefaultSuperAdmin(UserRepository userRepository) {
        if (userRepository.findByUsername("superadmin").isPresent()) {
            return;
        }

        userRepository.save(User.builder()
                .username("superadmin")
                .password(passwordEncoder.encode("superadmin123"))
                .fullName("Super Admin")
                .email("superadmin.local")
                .avatar("https://i.pravatar.cc/150?u=superadmin")
                .bio("Tài khoản Super Admin tự động dùng để phân quyền nhân sự.")
                .location("Hệ thống")
                .role(Role.SUPER_ADMIN)
                .provider("LOCAL")
                .emailVerified(true)
                .joinedAt(LocalDateTime.now())
                .build());
    }
}
