package com.compilerdemo.complier_demo.Controller.Controllers;

import com.compilerdemo.complier_demo.Model.DAO.Project;
import com.compilerdemo.complier_demo.Model.DAO.User;
import com.compilerdemo.complier_demo.Model.DTO.CreateProjectRequest;
import com.compilerdemo.complier_demo.Model.DTO.ProjectResponse;
import com.compilerdemo.complier_demo.Model.Repositories.BranchRepository;
import com.compilerdemo.complier_demo.Model.Repositories.ProjectRepository;
import com.compilerdemo.complier_demo.Services.ProjectService;
import com.compilerdemo.complier_demo.Services.UserService;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.*;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectsController {

    private final ProjectService projectService;
    private final ProjectRepository projectRepository;
    private final UserService userService;
    private final BranchRepository branchRepository;

    @Autowired
    public ProjectsController(ProjectService projectService, ProjectRepository projectRepository, UserService userService, BranchRepository branchRepository) {
        this.projectService = projectService;
        this.projectRepository = projectRepository;
        this.userService = userService;
        this.branchRepository = branchRepository;
    }

    @GetMapping("/userProjects")
    public List<ProjectResponse> getProjectsForUser(@AuthenticationPrincipal OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        List<Project> projects;
        List<ProjectResponse> projectDTOs = new ArrayList<>();
        projects = projectRepository.findByOwnerEmail(email);
        for(Project project : projects) {
            if(branchRepository.findByBranchProject(project).isPresent()){
                projectDTOs.add(new ProjectResponse(project.getId(),project.getName(),project.getLanguage(),email,true));
            }
            else{
                projectDTOs.add(new ProjectResponse(project.getId(),project.getName(),project.getLanguage(),email,false));
            }

        }
        return projectDTOs;
    }


    @PostMapping("/createNewProject")
    public ResponseEntity<Project> createNewProject(@RequestBody CreateProjectRequest createProjectRequest,
                                                    @AuthenticationPrincipal OAuth2User oAuth2User) {

        if (createProjectRequest.getName() == null ) {
            return ResponseEntity.badRequest().build();
        }
        User user = userService.getCurrentUser(oAuth2User);

        Project newProject = projectService.createProject(createProjectRequest, user);
        return ResponseEntity.ok(newProject);
    }
    @GetMapping("/openProject/{id}")
    public ResponseEntity<String> getProjectCode(@PathVariable long id) {
        String code = projectService.getCodeFromProject(id);
        return ResponseEntity.ok(code);
    }



    @PutMapping("/rename/{projectId}")
    public ResponseEntity<?> renameProject(@PathVariable Long projectId,  @RequestBody Map<String, String> request) {
        String name = request.get("newName");
        name = name.trim().replace("\"", "");
        try {
            projectService.renameProject(projectId,name);
            return ResponseEntity.ok(name);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{projectId}")
    public void deleteProject(@PathVariable Long projectId) {
        projectService.deleteProjectById(projectId);
    }
}
