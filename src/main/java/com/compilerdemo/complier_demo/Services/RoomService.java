package com.compilerdemo.complier_demo.Services;

import com.compilerdemo.complier_demo.Model.DAO.Project;
import com.compilerdemo.complier_demo.Model.DAO.Room;
import com.compilerdemo.complier_demo.Model.DAO.RoomUser;
import com.compilerdemo.complier_demo.Model.DTO.RoomUsersResponse;
import com.compilerdemo.complier_demo.Model.Repositories.ProjectRepository;
import com.compilerdemo.complier_demo.Model.Repositories.RoomRepository;
import org.springframework.beans.factory.annotation.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RoomService {
    private final RoomRepository roomRepository;
    private final ProjectRepository projectRepository;

    public RoomService(RoomRepository roomRepository, ProjectRepository projectRepository) {
        this.roomRepository = roomRepository;
        this.projectRepository = projectRepository;
    }

    public Room createRoom(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        Room room = new Room();
        room.setProject(project);
        room.setRoomId(UUID.randomUUID().toString());
        room.setOwner(project.getOwner());
        roomRepository.save(room);
        return room;
    }

    public Room findRoomByRoomId(String roomId) {
        return roomRepository.findByRoomId(roomId);
    }
    public Set<RoomUsersResponse> getRoomUsers(String roomId) {
        Room room = findRoomByRoomId(roomId);
        List<RoomUsersResponse> users = new ArrayList<>();
        List<RoomUser> roomUsers = room.getRoomUsers();

        for (RoomUser roomUser : roomUsers) {
            Long userId = roomUser.getMember().getId();
            String userName = roomUser.getMember().getName();
            String userEmail = roomUser.getMember().getEmail();
            RoomUser.Role role = roomUser.getRole();
            users.add(new RoomUsersResponse(userId, userName, userEmail, role, roomId));
        }

        Set<RoomUsersResponse> uniqueUsers = new HashSet<>(users);
        return uniqueUsers;
    }

}
