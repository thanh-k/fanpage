package com.example.fanpagebackend.common;

public enum ViolationType {
    SPAM("Spam / Quảng cáo rác"),
    HATE_SPEECH("Ngôn từ gây thù ghét / Xúc phạm"),
    HARASSMENT("Quấy rối / Bắt nạt cá nhân"),
    NUDITY_PORNOGRAPHY("Nội dung khiêu dâm / Đồi trụy"),
    VIOLENCE_CRUELTY("Bạo lực / Ghê rợn máu me"),
    FRAUD_SCAM("Lừa đảo / Giả mạo"),
    FALSE_INFORMATION("Tin giả / Sai sự thật"),
    OTHER("Lý do khác");

    private final String label;

    ViolationType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}