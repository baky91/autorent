package com.baky91.autorent.repository;

import com.baky91.autorent.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
