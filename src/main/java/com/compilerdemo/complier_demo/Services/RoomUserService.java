package com.compilerdemo.complier_demo.Services;

import com.compilerdemo.complier_demo.Model.DAO.Room;
import com.compilerdemo.complier_demo.Model.DAO.RoomUser;
import com.compilerdemo.complier_demo.Model.DAO.User;
import com.compilerdemo.complier_demo.Model.Repositories.RoomUserRepository;
import org.springframework.stereotype.Service;

@Service
public class RoomUserService {
    private final RoomUserRepository roomUserRepository;
    private final RoomService roomService;

    public RoomUserService(RoomUserRepository roomUserRepository, RoomService roomService) {
        this.roomUserRepository = roomUserRepository;
        this.roomService = roomService;
    }

    public void assignRole(long memberId, String newRole, String roomId) {
        RoomUser roomUser = roomUserRepository.findByMemberIdAndRoomRoomId(memberId,roomId);
        if (newRole.equals("viewer")) {
            roomUser.setRole(RoomUser.Role.VIEWER);
        }
        else if(newRole.equals("editor")) {
            roomUser.setRole(RoomUser.Role.EDITOR);
        }
        roomUserRepository.save(roomUser);
    }
    public void createRoomUser(String roomId, User member) {
        Room room = roomService.findRoomByRoomId(roomId);
        RoomUser roomUser = new RoomUser();
        roomUser.setRoom(room);
        roomUser.setMember(member);
        roomUser.setRole(RoomUser.Role.VIEWER);
        roomUserRepository.save(roomUser);
    }
}
