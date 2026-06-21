package com.example.fanpagebackend.common;

import java.time.LocalDateTime;

public enum UserLockDuration {
    THIRTY_MINUTES,
    FOURTEEN_DAYS,
    ONE_MONTH;

    public LocalDateTime resolveUntil() {
        LocalDateTime now = LocalDateTime.now();
        return switch (this) {
            case THIRTY_MINUTES -> now.plusMinutes(30);
            case FOURTEEN_DAYS -> now.plusDays(14);
            case ONE_MONTH -> now.plusMonths(1);
        };
    }

    public String getLabel() {
        return switch (this) {
            case THIRTY_MINUTES -> "30 phút";
            case FOURTEEN_DAYS -> "14 ngày";
            case ONE_MONTH -> "1 tháng";
        };
    }
}
