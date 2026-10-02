package com.baky91.autorent.service;

import com.baky91.autorent.dto.UserDTO;
import com.baky91.autorent.model.User;
import com.baky91.autorent.model.exception.ObjectNotFoundException;
import com.baky91.autorent.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthentificationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthentificationService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public User signup(UserDTO.RegisterAndLogin input) {
        User user = new User(input.username(), passwordEncoder.encode(input.password()));
        user.setRole(User.Role.USER);

        return userRepository.save(user);
    }

    public User signin(UserDTO.RegisterAndLogin input) {
        User user = userRepository.findByUsername(input.username())
                .orElseThrow(() -> new ObjectNotFoundException("L'utilisateur n'a pas été trouvé : " + input.username()));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.username(),
                        input.password()
                )
        );
        return user;
    }

}
