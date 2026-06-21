package com.example.fanpagebackend.util;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.Arrays;
import java.util.Locale;

public final class AvatarUtil {

    private AvatarUtil() {
    }

    public static String createInitialAvatar(String fullName) {
        String initials = getInitials(fullName);
        String svg = "<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'>"
                + "<rect width='150' height='150' rx='32' fill='#0ea5e9'/>"
                + "<text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle'"
                + " font-family='Arial, sans-serif' font-size='54' font-weight='700' fill='white'>"
                + initials
                + "</text></svg>";

        return "data:image/svg+xml," + URLEncoder.encode(svg, StandardCharsets.UTF_8);
    }

    public static String getInitials(String fullName) {
        String normalized = fullName == null ? "" : fullName.trim().replaceAll("\\s+", " ");
        if (normalized.isBlank()) {
            return "US";
        }

        String[] parts = normalized.split(" ");
        if (parts.length >= 2) {
            return (firstLetter(parts[0]) + firstLetter(parts[parts.length - 1])).toUpperCase(Locale.ROOT);
        }

        String plain = removeAccent(parts[0]).replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);
        if (plain.length() >= 2) {
            return plain.substring(0, 2);
        }
        if (plain.length() == 1) {
            return plain + plain;
        }
        return "US";
    }

    private static String firstLetter(String value) {
        String plain = removeAccent(value).replaceAll("[^A-Za-z0-9]", "");
        if (plain.isBlank()) {
            return "U";
        }
        return plain.substring(0, 1);
    }

    private static String removeAccent(String value) {
        String normalized = Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "").replace('đ', 'd').replace('Đ', 'D');
    }
}
