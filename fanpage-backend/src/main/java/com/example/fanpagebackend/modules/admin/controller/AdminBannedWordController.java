package com.example.fanpagebackend.modules.admin.controller;

import com.example.fanpagebackend.common.ApiResponse;
import com.example.fanpagebackend.common.PageResponse;
import com.example.fanpagebackend.exception.BadRequestException;
import com.example.fanpagebackend.exception.NotFoundException;
import com.example.fanpagebackend.modules.post.entity.BannedWord;
import com.example.fanpagebackend.modules.post.repository.BannedWordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;


@RestController
@RequestMapping("/api/admin/banned-words")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF','SUPER_ADMIN')")
public class AdminBannedWordController {

   private final BannedWordRepository bannedWordRepository;

    @GetMapping
    public ApiResponse<PageResponse<BannedWord>> getAllWords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 10 : Math.min(size, 100);
        Page<BannedWord> words = bannedWordRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        PageResponse<BannedWord> response = PageResponse.<BannedWord>builder()
                .items(words.getContent())
                .page(words.getNumber())
                .size(words.getSize())
                .totalItems(words.getTotalElements())
                .totalPages(words.getTotalPages())
                .hasMore(words.hasNext())
                .build();

        return ApiResponse.success("Lấy danh sách từ cấm thành công", response);
    }

    /**
     * Thêm từ cấm mới
     */
    @PostMapping
    public ApiResponse<BannedWord> addWord(
            @RequestBody BannedWord bannedWord
    ) {

        if (bannedWord == null ||
                bannedWord.getWord() == null ||
                bannedWord.getWord().trim().isEmpty()) {

            throw new BadRequestException(
                    "Dữ liệu từ cấm không được để trống"
            );
        }

        String cleanWord = bannedWord
                .getWord()
                .trim();

        if (bannedWordRepository
                .existsByWordIgnoreCase(cleanWord)) {

            throw new BadRequestException(
                    "Từ '" + cleanWord + "' đã tồn tại"
            );
        }

        bannedWord.setWord(cleanWord);

        BannedWord savedWord =
                bannedWordRepository.save(bannedWord);

        return ApiResponse.success(
                "Bổ sung từ cấm thành công",
                savedWord
        );
    }

    /**
     * Xóa từ cấm
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteWord(
            @PathVariable Long id
    ) {

        if (!bannedWordRepository.existsById(id)) {

            throw new NotFoundException(
                    "Không tìm thấy từ cấm"
            );
        }

        bannedWordRepository.deleteById(id);

        return ApiResponse.success(
                "Xóa từ cấm thành công",
                null
        );
    }
}