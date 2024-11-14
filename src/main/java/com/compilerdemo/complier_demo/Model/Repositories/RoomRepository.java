package com.compilerdemo.complier_demo.Model.Repositories;

import com.compilerdemo.complier_demo.Model.DAO.Room;
import com.compilerdemo.complier_demo.Model.DAO.RoomUser;
import com.compilerdemo.complier_demo.Model.DAO.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Room findByRoomId(String roomId);
}
