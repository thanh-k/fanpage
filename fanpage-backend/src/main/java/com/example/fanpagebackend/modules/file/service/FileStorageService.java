package com.example.fanpagebackend.modules.file.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    String storeAvatar(MultipartFile file, String oldAvatarUrl);

    String storePostMedia(MultipartFile file, String mediaFolderName);
}
