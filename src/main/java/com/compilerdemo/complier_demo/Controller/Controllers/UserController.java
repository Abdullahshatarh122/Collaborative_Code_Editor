package com.compilerdemo.complier_demo.Controller.Controllers;


import com.compilerdemo.complier_demo.Model.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserRepository userRepository;

    @Autowired
    public UserController(UserRepository userRepository) {

        this.userRepository = userRepository;
    }

    @GetMapping("/api/user/currentUserId")
    public Map<String, Object> getCurrentUser(Principal principal) {
        String name = principal.getName();

        Map<String, Object> response = new HashMap<>();
        int id = userRepository.getUserByName(name);
        response.put("userId", id);
        return response;
    }

}