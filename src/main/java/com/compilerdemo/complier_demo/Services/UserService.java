package com.compilerdemo.complier_demo.Services;

import com.compilerdemo.complier_demo.Model.DAO.User;
import com.compilerdemo.complier_demo.Model.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.*;

import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.*;

import java.util.NoSuchElementException;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User getCurrentUser(OAuth2User oAuth2User) {
        if (oAuth2User == null) {
            throw new IllegalArgumentException("User is not authenticated");
        }
        String email = oAuth2User.getAttribute("email");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("NO user found with this email : " + email));
    }

}