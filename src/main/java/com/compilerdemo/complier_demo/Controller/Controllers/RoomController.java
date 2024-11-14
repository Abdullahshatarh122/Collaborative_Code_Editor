package com.compilerdemo.complier_demo.Controller.Controllers;

import com.compilerdemo.complier_demo.Model.DAO.Project;
import com.compilerdemo.complier_demo.Model.DAO.Room;
import com.compilerdemo.complier_demo.Model.DAO.User;
import com.compilerdemo.complier_demo.Model.DTO.OpenRoomResponse;
import com.compilerdemo.complier_demo.Model.DTO.RoomUsersResponse;
import com.compilerdemo.complier_demo.Services.ProjectService;
import com.compilerdemo.complier_demo.Services.RoomService;
import com.compilerdemo.complier_demo.Services.RoomUserService;
import com.compilerdemo.complier_demo.Services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;
    private final UserService userService;
    private final ProjectService projectService;
    private final RoomUserService roomUserService;

    public RoomController(RoomService roomService, UserService userService, ProjectService projectService, RoomUserService roomUserService) {
        this.roomService = roomService;
        this.userService = userService;
        this.projectService = projectService;
        this.roomUserService = roomUserService;
    }

    @PostMapping("/createRoom")
    public ResponseEntity<?> createRoom(@RequestParam Long projectId) {
        Room room = roomService.createRoom(projectId);
        Map<String,String> response = new HashMap<>();
        System.out.println("roomId : " + room.getRoomId());
        response.put("roomId", room.getRoomId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/joinRoom")
    public ResponseEntity<?> joinRoom(@RequestParam String roomId) {
        Room room = roomService.findRoomByRoomId(roomId);
        if (room != null) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Room not found");
    }

    @PostMapping("/createRoomUser")
    public ResponseEntity<?> createRoomUser(@RequestParam String roomId, @AuthenticationPrincipal OAuth2User oAuth2User) {
        System.out.println("Received joinRoom request for roomId: " + roomId);
        Room room = roomService.findRoomByRoomId(roomId);
        User currentUser = userService.getCurrentUser(oAuth2User);

        if (!currentUser.equals(room.getOwner())) {
            roomUserService.createRoomUser(roomId, currentUser);
            return ResponseEntity.ok().build();
        }
        System.out.println("roomId after build : " + roomId);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/openRoom/{roomId}")
    public ResponseEntity<?> openRoom(@PathVariable String roomId, @AuthenticationPrincipal OAuth2User oAuth2User) {

            Room room = roomService.findRoomByRoomId(roomId);
            if (room == null) {
                Map<String,String> error = new HashMap<>();
                error.put("error", "Room not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            User currentUser = userService.getCurrentUser(oAuth2User);
            boolean isGuest = !currentUser.equals(room.getOwner());
            Project project = room.getProject();
            OpenRoomResponse response = new OpenRoomResponse();
            response.setProjectId(project.getId());
            response.setLanguage(project.getLanguage());
            response.setCode(projectService.getCodeFromProject(project.getId()));
            return ResponseEntity.ok(response);
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<?> getRoomDetails(@PathVariable String roomId, @AuthenticationPrincipal OAuth2User oAuth2User ) {
        Room room = roomService.findRoomByRoomId(roomId);
        User currentUser = userService.getCurrentUser(oAuth2User);
        boolean isOwner = (currentUser.equals(room.getOwner()));

        Map<String, Boolean> roomDetails = new HashMap<>();
        roomDetails.put("isOwner", isOwner);

        return ResponseEntity.ok(roomDetails);
    }
    @GetMapping("/{roomId}/users")
    public Set<RoomUsersResponse> getUsersInRoom(@PathVariable String roomId) {
        return roomService.getRoomUsers(roomId);
    }
    @PostMapping("/assignRole")
    public ResponseEntity<?> assignRole(@RequestParam long userId, @RequestParam String role, @RequestParam String roomId, @AuthenticationPrincipal OAuth2User oAuth2User) {
        Room room = roomService.findRoomByRoomId(roomId);
        User currentUser = userService.getCurrentUser(oAuth2User);

        if (currentUser.equals(room.getOwner())) {
            roomUserService.assignRole(userId, role,roomId);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }


}



