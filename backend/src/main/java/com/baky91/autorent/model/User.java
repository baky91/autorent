package com.baky91.autorent.model;

import com.baky91.autorent.dto.UserDTO;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    public enum Role {
        USER,
        ADMIN
    }

    @Id
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    // CONSTRUCTORS
    public User() {}

    public User(
            String username,
            String password,
            String email,
            Role role
    ) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
    }

    // GETTERS AND SETTERS

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public UserDTO.Output toDto() {
        return new UserDTO.Output(
            id,
            username,
            email,
            role
        );
    }
}
