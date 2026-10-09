package com.baky91.autorent.controller;

import com.baky91.autorent.dto.UserDTO;
import com.baky91.autorent.model.User;
import com.baky91.autorent.service.AuthentificationService;
import com.baky91.autorent.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthentificationController {

    private final JwtService jwtService;
    private final AuthentificationService authentificationService;

    public AuthentificationController(JwtService jwtService, AuthentificationService authentificationService) {
        this.jwtService = jwtService;
        this.authentificationService = authentificationService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody UserDTO.RegisterAndLogin input) {
        User registeredUser = authentificationService.signup(input);
        return ResponseEntity.ok(registeredUser);
    }

    @PostMapping("/login")
    public ResponseEntity<UserDTO.LoginResponse> login(@RequestBody UserDTO.RegisterAndLogin input) {
        User authenticatedUser = authentificationService.signin(input);
        String jwtToken = jwtService.generateToken(authenticatedUser);
        UserDTO.LoginResponse loginResponse = new UserDTO.LoginResponse(jwtToken, jwtService.getExpirationTime());
        return ResponseEntity.ok(loginResponse);
    }
}
