package com.compilerdemo.complier_demo.Model.DTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommitRequest {

    private long projectId;
    private String Code;
}
