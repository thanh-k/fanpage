package com.example.fanpagebackend.modules.comment.service;

import com.example.fanpagebackend.modules.comment.dto.request.AddCommentRequest;
import com.example.fanpagebackend.modules.comment.dto.response.CommentResponse;

import java.util.List;

public interface CommentService {

    List<CommentResponse> getCommentsByPost(Long postId);

    CommentResponse addComment(Long postId, AddCommentRequest request);
}
