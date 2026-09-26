package com.baky91.autorent.dto;

import com.baky91.autorent.model.User;

public class UserDTO {

    public record PostInput (
        String username,
        String password
    ) {}

    public record PostOutput (
        Long id,
        String username,
        String email,
        User.Role role
    ) {}

    public record Output(
        Long id,
        String username,
        String email,
        User.Role role
    ) {}

}
