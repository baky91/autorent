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
        String firstName,
        String lastName,
        String email,
        String phone,
        User.Role role
    ) {}

    public record GetOutput (
        Long id,
        String username,
        String firstName,
        String lastName,
        String email,
        String phone,
        User.Role role
    ) {}

}
