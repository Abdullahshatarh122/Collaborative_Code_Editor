package com.compilerdemo.complier_demo.Controller.Controllers;

import com.compilerdemo.complier_demo.Model.DAO.User;
import com.compilerdemo.complier_demo.Model.Repositories.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Optional;

@Controller
public class OAuth2LoginController {

    private final UserRepository userRepository;

    public OAuth2LoginController(UserRepository userRepository) {

        this.userRepository = userRepository;
    }
    @GetMapping("/saveUser")
    public String saveUser(@AuthenticationPrincipal OAuth2User oauthUser) {
        if (oauthUser == null) {
            throw new IllegalStateException("User not authenticated");
        }
            String email = oauthUser.getAttribute("email");
            String name = oauthUser.getAttribute("name");

            Optional<User> userOptional = userRepository.findByEmail(email);
            User user;
            if (userOptional.isPresent()) {
                user = userOptional.get();
                user.setName(name);
                userRepository.save(user);
            } else {
                user = new User();
                user.setEmail(email);
                user.setName(name);
                userRepository.save(user);
            }

        return "redirect:/collaborative-editor/index.html";
        }

}




