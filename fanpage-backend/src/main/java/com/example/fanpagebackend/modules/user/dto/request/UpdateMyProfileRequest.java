package com.example.fanpagebackend.modules.user.dto.request;

import com.example.fanpagebackend.common.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class UpdateMyProfileRequest {

    @NotBlank(message = "Tên hiển thị không được để trống")
    @Size(max = 100, message = "Tên hiển thị không được vượt quá 100 ký tự")
    private String name;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    private Gender gender = Gender.PRIVATE;

    @Size(max = 500, message = "Giới thiệu không được vượt quá 500 ký tự")
    private String bio;

    @Size(max = 100, message = "Địa điểm không được vượt quá 100 ký tự")
    private String location;

    private MultipartFile avatarFile;
}
