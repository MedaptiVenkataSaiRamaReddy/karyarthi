package com.example.demo.service.impl;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserService;
import org.springframework.stereotype.Service;
import java.util.Optional;
@Service
public class UserServiceImpl implements UserService {
    private final UserRepository repo;
    public UserServiceImpl(UserRepository repo) { this.repo = repo; }
    @Override public User create(User u) { return repo.save(u); }
    @Override public Optional<User> findById(String id) { return repo.findById(id); }
    @Override public Optional<User> findByEmail(String e) { return repo.findByEmail(e); }
}