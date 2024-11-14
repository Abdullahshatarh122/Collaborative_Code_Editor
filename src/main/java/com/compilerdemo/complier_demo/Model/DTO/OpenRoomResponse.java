package com.compilerdemo.complier_demo.Model.DTO;
import lombok.*;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class OpenRoomResponse {
    private Long projectId;
    private String code;
    private String language;
}