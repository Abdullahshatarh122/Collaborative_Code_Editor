package com.compilerdemo.complier_demo.Model.Repositories;

import com.compilerdemo.complier_demo.Model.DAO.File;
import com.compilerdemo.complier_demo.Model.DAO.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface FileRepository extends JpaRepository<File, Long> {
    File findByProject(Project project);

    File findByProjectId(Long projectId);
}

