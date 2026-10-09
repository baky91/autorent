package com.baky91.autorent.dto;

import com.baky91.autorent.model.User;
import jakarta.validation.constraints.NotBlank;

public class UserDTO {

    public record Output (
        Long id,
        String username,
        User.Role role
    ) {}

    public record RegisterAndLogin (
        @NotBlank(message = "Le nom d'utilisateur est requis")
        String username,

        @NotBlank(message = "Le mot de passe est requis")
        String password
    ) {}

    public record LoginResponse(
        String token,
        long expiresIn
    ) {}

}
