package com.compilerdemo.complier_demo.Model.DTO;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateProjectRequest {
    private String name;
    private String language;
}
