package com.example.fanpagebackend.modules.post.service;

import com.example.fanpagebackend.modules.post.entity.BannedWord;
import com.example.fanpagebackend.modules.post.repository.BannedWordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ProfanityFilterService {

    private final BannedWordRepository bannedWordRepository;

    /**
     * Quét toàn bộ nội dung bài viết/comment.
     * Trả về true nếu nội dung có chứa bất kỳ từ/cụm từ nào trong bảng banned_words.
     *
     * Ví dụ:
     * - banned word: "dm"
     * - content: "abcd xyz dm abc"
     * => bị chặn
     */
    public boolean checkTextViolation(String sourceText) {
        if (sourceText == null || sourceText.isBlank()) {
            return false;
        }

        String normalizedText = normalizeForCheck(sourceText);
        if (normalizedText.isBlank()) {
            return false;
        }

        List<BannedWord> databaseWords = bannedWordRepository.findAll();

        for (BannedWord item : databaseWords) {
            if (item == null || item.getWord() == null || item.getWord().isBlank()) {
                continue;
            }

            String bannedWord = normalizeForCheck(item.getWord());
            if (bannedWord.isBlank()) {
                continue;
            }

            if (containsBannedWord(normalizedText, bannedWord)) {
                return true;
            }
        }

        return false;
    }

    private boolean containsBannedWord(String normalizedText, String bannedWord) {
        String escapedBannedWord = Pattern.quote(bannedWord);

        /**
         * Không dùng equals() vì bài viết thường là một đoạn văn dài.
         * Dùng ranh giới ký tự để bắt được từ/cụm từ nằm giữa câu,
         * đồng thời hạn chế chặn nhầm khi từ cấm nằm trong một từ sạch dài hơn.
         *
         * Ví dụ bị chặn:
         * - "dm"
         * - "abc dm xyz"
         * - "abc, dm! xyz"
         *
         * Ví dụ hạn chế chặn nhầm:
         * - "admin" không bị chặn chỉ vì có "dm" liền trong từ.
         */
        Pattern pattern = Pattern.compile(
                "(^|[^\\p{L}\\p{N}_])" + escapedBannedWord + "($|[^\\p{L}\\p{N}_])",
                Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
        );

        return pattern.matcher(normalizedText).find();
    }

    private String normalizeForCheck(String text) {
        if (text == null) {
            return "";
        }

        return Normalizer
                .normalize(text, Normalizer.Form.NFKC)
                .toLowerCase()
                .replaceAll("[\\u200B-\\u200D\\uFEFF]", "")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
