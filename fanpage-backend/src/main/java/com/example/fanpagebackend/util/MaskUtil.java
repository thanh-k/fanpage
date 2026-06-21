package com.example.fanpagebackend.util;

public class MaskUtil {

    private MaskUtil() {
    }

    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return null;
        }

        String[] parts = email.split("@");
        String localPart = parts[0];
        String domainPart = parts[1];

        if (localPart.length() <= 2) {
            return "**@" + domainPart;
        }

        return localPart.substring(0, 2) + "***@" + domainPart;
    }
}
