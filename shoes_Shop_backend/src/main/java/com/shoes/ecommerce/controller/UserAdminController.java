package com.shoes.ecommerce.controller;

import com.shoes.ecommerce.dto.UserDTO;
import com.shoes.ecommerce.entity.User;
import com.shoes.ecommerce.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserAdminController {
    private final UserRepository userRepository;
    private final Logger logger = LoggerFactory.getLogger(UserAdminController.class);

    public UserAdminController(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> list(){
        List<UserDTO> users = userRepository.findAll().stream().map(u -> new UserDTO(u.getId(), u.getUsername(), u.getEmail(), u.getRole(), u.getBannedUntil(), u.getBannedForever())).collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserDTO> setRole(@PathVariable Long id, @RequestParam String role){
        return userRepository.findById(id).map(u -> {
            u.setRole(role);
            userRepository.save(u);
            return ResponseEntity.ok(new UserDTO(u.getId(), u.getUsername(), u.getEmail(), u.getRole(), u.getBannedUntil(), u.getBannedForever()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/ban")
    public ResponseEntity<UserDTO> banUser(@PathVariable Long id, @RequestParam(required = false) Integer days, @RequestParam(required = false) Boolean forever){
        return userRepository.findById(id).map(u -> {
            if(Boolean.TRUE.equals(forever)){
                u.setBannedForever(true);
                u.setBannedUntil(null);
            } else if(days != null && days > 0){
                long until = System.currentTimeMillis() + (long)days * 24 * 60 * 60 * 1000;
                u.setBannedUntil(until);
                u.setBannedForever(false);
            } else {
                // unban
                u.setBannedForever(false);
                u.setBannedUntil(null);
            }
            userRepository.save(u);
            return ResponseEntity.ok(new UserDTO(u.getId(), u.getUsername(), u.getEmail(), u.getRole(), u.getBannedUntil(), u.getBannedForever()));
        }).orElse(ResponseEntity.notFound().build());
    }
}
