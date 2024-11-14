package com.compilerdemo.complier_demo.Model.DTO;

import com.compilerdemo.complier_demo.Model.DAO.RoomUser;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomUsersResponse {
    private long userId;
    private String name;
    private String userEmail;
    private RoomUser.Role role;
    private String roomId;

}
