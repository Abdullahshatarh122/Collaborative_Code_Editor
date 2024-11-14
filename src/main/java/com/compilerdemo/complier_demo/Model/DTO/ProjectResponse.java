package com.compilerdemo.complier_demo.Model.DTO;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectResponse {
    private Long id;
    private String name;
    private String language;
    private String ownerEmail;
    private Boolean isBranch;
}
