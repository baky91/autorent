package com.baky91.autorent.service;

import com.baky91.autorent.dto.UserDTO;
import com.baky91.autorent.model.User;
import com.baky91.autorent.model.exception.ObjectNotFoundException;
import com.baky91.autorent.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public UserDTO.Output getUserById(long id) throws ObjectNotFoundException {
        return userRepository.findById(id)
                             .map(User::toDto)
                             .orElseThrow(() -> new ObjectNotFoundException("L'utilisateur numéro %d n'a pas été trouvé".formatted(id)));
    }

    public List<UserDTO.Output> getAllUsers() {
        return userRepository.findAll()
                             .stream()
                             .map(User::toDto)
                             .toList();
    }

}
