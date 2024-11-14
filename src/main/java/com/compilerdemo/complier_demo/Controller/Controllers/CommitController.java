package com.compilerdemo.complier_demo.Controller.Controllers;


import com.compilerdemo.complier_demo.Model.DTO.CommitRequest;
import com.compilerdemo.complier_demo.Services.CommitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;


@RestController
@RequestMapping("/api/commit")
public class CommitController {
    private final CommitService commitService;

    public CommitController(CommitService commitService) {
        this.commitService = commitService;
    }

    @PostMapping
    public ResponseEntity<?> commitChanges(@RequestBody CommitRequest commitRequest) {
        boolean success = commitService.commitProjectChanges(commitRequest.getProjectId(), commitRequest.getCode());
        Map<String, Boolean> response = new HashMap<>();
        response.put("success", true);

        if (success) {
            response.put("success", true);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(response);
        }

    }
}
