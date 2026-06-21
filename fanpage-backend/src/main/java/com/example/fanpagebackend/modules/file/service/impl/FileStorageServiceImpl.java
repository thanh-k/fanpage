package com.example.fanpagebackend.modules.file.service.impl;

import com.example.fanpagebackend.exception.BadRequestException;
import com.example.fanpagebackend.modules.file.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final Set<String> ALLOWED_AVATAR_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final Set<String> ALLOWED_POST_IMAGE_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final Set<String> ALLOWED_POST_VIDEO_CONTENT_TYPES = Set.of(
            "video/mp4",
            "video/webm",
            "video/ogg",
            "video/quicktime"
    );

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public String storeAvatar(MultipartFile file, String oldAvatarUrl) {
        if (file == null || file.isEmpty()) {
            return oldAvatarUrl;
        }

        validateAvatar(file);
        String avatarUrl = storeFile(file, "avatars", "avatar-");
        deleteOldAvatarIfNeeded(oldAvatarUrl);
        return avatarUrl;
    }

    @Override
    public String storePostMedia(MultipartFile file, String mediaFolderName) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        validatePostMedia(file, mediaFolderName);
        return storeFile(file, Paths.get("posts", mediaFolderName).toString(), "post-");
    }

    private String storeFile(MultipartFile file, String subFolder, String filePrefix) {
        try {
            Path targetDirectory = Paths.get(uploadDir, subFolder)
                    .toAbsolutePath()
                    .normalize();

            Files.createDirectories(targetDirectory);

            String extension = getFileExtension(file.getOriginalFilename());
            String fileName = filePrefix + UUID.randomUUID() + extension;
            Path targetPath = targetDirectory.resolve(fileName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            String normalizedSubFolder = subFolder.replace("\\", "/");
            return "/uploads/" + normalizedSubFolder + "/" + fileName;
        } catch (IOException ex) {
            throw new BadRequestException("Không thể lưu file đã tải lên");
        }
    }

    private void validateAvatar(MultipartFile file) {
        String contentType = normalizeContentType(file.getContentType());

        if (!ALLOWED_AVATAR_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("Ảnh đại diện phải là file jpg, png, webp hoặc gif");
        }

        long maxSize = 5 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new BadRequestException("Ảnh đại diện không được lớn hơn 5MB");
        }
    }

    private void validatePostMedia(MultipartFile file, String mediaFolderName) {
        String contentType = normalizeContentType(file.getContentType());

        if ("images".equalsIgnoreCase(mediaFolderName)) {
            if (!ALLOWED_POST_IMAGE_CONTENT_TYPES.contains(contentType)) {
                throw new BadRequestException("Ảnh bài viết phải là file jpg, png, webp hoặc gif");
            }

            long maxSize = 10 * 1024 * 1024;
            if (file.getSize() > maxSize) {
                throw new BadRequestException("Mỗi ảnh bài viết không được lớn hơn 10MB");
            }
            return;
        }

        if ("videos".equalsIgnoreCase(mediaFolderName)) {
            if (!ALLOWED_POST_VIDEO_CONTENT_TYPES.contains(contentType)) {
                throw new BadRequestException("Video bài viết phải là file mp4, webm, ogg hoặc mov");
            }

            long maxSize = 50 * 1024 * 1024;
            if (file.getSize() > maxSize) {
                throw new BadRequestException("Mỗi video bài viết không được lớn hơn 50MB");
            }
            return;
        }

        throw new BadRequestException("Loại thư mục media không hợp lệ");
    }

    private String normalizeContentType(String contentType) {
        if (!StringUtils.hasText(contentType)) {
            return "";
        }

        return contentType.trim().toLowerCase(Locale.ROOT);
    }

    private String getFileExtension(String fileName) {
        String cleaned = StringUtils.hasText(fileName) ? fileName : "file.bin";
        int dotIndex = cleaned.lastIndexOf('.');

        if (dotIndex < 0) {
            return ".bin";
        }

        return cleaned.substring(dotIndex);
    }

    private void deleteOldAvatarIfNeeded(String oldAvatarUrl) {
        if (!StringUtils.hasText(oldAvatarUrl) || !oldAvatarUrl.startsWith("/uploads/avatars/")) {
            return;
        }

        try {
            String fileName = oldAvatarUrl.replace("/uploads/avatars/", "");
            Path oldPath = Paths.get(uploadDir, "avatars", fileName).toAbsolutePath().normalize();
            Files.deleteIfExists(oldPath);
        } catch (IOException ignored) {
        }
    }
}
