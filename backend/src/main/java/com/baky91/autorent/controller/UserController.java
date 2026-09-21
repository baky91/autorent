package com.baky91.autorent.controller;

import com.baky91.autorent.dto.UserDTO;
import com.baky91.autorent.model.exception.ObjectNotFoundException;
import com.baky91.autorent.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    /* CREATE (POST) */

    /* READ (GET) */

    @GetMapping
    public List<UserDTO.GetOutput> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserDTO.GetOutput getUser(@PathVariable Long id) throws ObjectNotFoundException {
        return userService.getUserById(id);
    }

    /* UPDATE (PUT) */

    /* DELETE (DELETE) */

}
