package com.compilerdemo.complier_demo.Controller.Controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@Controller
public class LoginController {

    @GetMapping("/login")
    public String login() {
        return "redirect:collaborative-editor/login.html";
    }
    @GetMapping("/")
    public String home(){
        return "redirect:collaborative-editor/index.html";
    }

}
