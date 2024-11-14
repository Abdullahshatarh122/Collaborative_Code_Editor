package com.compilerdemo.complier_demo.Model.Repositories;

import com.compilerdemo.complier_demo.Model.DAO.Project;
import com.compilerdemo.complier_demo.Model.DAO.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOwner(Optional<User> owner);

    List<Project> findByOwnerEmail(String email);


}

