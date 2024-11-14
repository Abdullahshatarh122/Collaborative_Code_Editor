package com.compilerdemo.complier_demo.Model.Repositories;

import com.compilerdemo.complier_demo.Model.DAO.RoomUser;
import com.compilerdemo.complier_demo.Model.DAO.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomUserRepository extends JpaRepository<RoomUser, Long> {

    RoomUser findByMemberIdAndRoomRoomId(Long memberId, String roomId);
}
