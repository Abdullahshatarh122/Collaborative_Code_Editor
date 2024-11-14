package com.compilerdemo.complier_demo.Model.DTO;


import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CodeExecutionResponse {
    private String output;
    private String error;

}