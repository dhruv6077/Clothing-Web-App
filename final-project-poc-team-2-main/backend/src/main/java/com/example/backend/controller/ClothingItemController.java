package com.example.backend.controller;

import com.example.backend.dto.ClothingItemDTO;
import com.example.backend.repository.ClothingItemRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/clothing-items")
public class ClothingItemController {

    private final ClothingItemRepository repo;

    public ClothingItemController(ClothingItemRepository repo) {
        this.repo = repo;
    }

    @GetMapping("")                    // GET /items
    public List<ClothingItemDTO> findAll() {
        return repo.findAllProjectedBy();
    }
}
