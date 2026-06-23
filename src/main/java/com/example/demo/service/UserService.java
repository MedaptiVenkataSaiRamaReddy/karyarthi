package com.example.demo.service;
import com.example.demo.entity.User;
import java.util.Optional;
public interface UserService {
    User create(User user);
    Optional<User> findById(String id);
    Optional<User> findByEmail(String email);
}