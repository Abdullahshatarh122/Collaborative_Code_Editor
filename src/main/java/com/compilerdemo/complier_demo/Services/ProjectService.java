package com.compilerdemo.complier_demo.Services;

import com.compilerdemo.complier_demo.Model.DAO.File;
import com.compilerdemo.complier_demo.Model.DAO.Project;
import com.compilerdemo.complier_demo.Model.DAO.User;
import com.compilerdemo.complier_demo.Model.DTO.CreateProjectRequest;
import com.compilerdemo.complier_demo.Model.Repositories.FileRepository;
import com.compilerdemo.complier_demo.Model.Repositories.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final FileService fileService;
    private final FileRepository fileRepository;

    @Autowired
    public ProjectService(ProjectRepository projectRepository, FileService fileService, FileRepository fileRepository) {
        this.projectRepository = projectRepository;
        this.fileService = fileService;
        this.fileRepository = fileRepository;
    }

    public Project createProject(CreateProjectRequest createProjectRequest,User user) {

        Project newProject = new Project();
        newProject.setName(createProjectRequest.getName());
        newProject.setLanguage(createProjectRequest.getLanguage());
        newProject.setOwner(user);
        newProject.setCreatedAt(LocalDateTime.now());
        newProject.setLastModifiedAt(LocalDateTime.now());
        newProject = projectRepository.save(newProject);
        fileService.createFile(newProject);
        return newProject;
    }

    public void deleteProjectById(Long projectId) {
        projectRepository.deleteById(projectId);
    }

    public Project updateCode(Project project, String newCode) {
        project.getFile().setContent(newCode);
        project.getFile().setUpdatedAt(LocalDateTime.now());
        project.setLastModifiedAt(LocalDateTime.now());
        fileRepository.save(project.getFile());
        return projectRepository.save(project);

    }

    public void renameProject(Long projectId, String newName) {
        Optional<Project> projectOptional = projectRepository.findById(projectId);
        if (projectOptional.isPresent()) {
            Project project = projectOptional.get();
            project.getFile().setName(newName);
            project.setName(newName);
            project.setLastModifiedAt(LocalDateTime.now());
            try {
                projectRepository.save(project);
            } catch (DataIntegrityViolationException e) {
                throw new IllegalArgumentException("You already have a project with this name try another name!");
            }
        } else {
            throw new NoSuchElementException("There is not project with this name");
        }
    }
    public String getCodeFromProject(Long projectId) {

        File file = fileService.getFilesByProjectId(projectId);
        return file.getContent();
    }
}
