package com.compilerdemo.complier_demo.Controller.Controllers;

import com.compilerdemo.complier_demo.Model.DAO.Branch;
import com.compilerdemo.complier_demo.Model.DAO.Project;
import com.compilerdemo.complier_demo.Model.DAO.User;
import com.compilerdemo.complier_demo.Model.Repositories.ProjectRepository;
import com.compilerdemo.complier_demo.Services.BranchService;
import com.compilerdemo.complier_demo.Services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final BranchService branchService;
    private final UserService userService;
    private final ProjectRepository projectRepository;

    public BranchController(BranchService branchService, UserService userService, ProjectRepository projectRepository) {
        this.branchService = branchService;
        this.userService = userService;
        this.projectRepository = projectRepository;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createBranch(@RequestParam Long projectId, @RequestParam String branchName,@AuthenticationPrincipal OAuth2User oAuth2User) {

        User user = userService.getCurrentUser(oAuth2User);

        Project project = projectRepository.findById(projectId).get();
        Branch branch = branchService.createBranch(project, branchName, user);
        if(branch != null) {
            return ResponseEntity.ok().build();
        }
        else
            return ResponseEntity.internalServerError().build();

    }


}
