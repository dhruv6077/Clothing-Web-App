package com.example.backend.repository;

import com.example.backend.model.ClothingItem;
import com.example.backend.dto.ClothingItemDTO;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClothingItemRepository extends JpaRepository<ClothingItem, Long> {

    /** Spring-Data builds the DTO record automatically */
    List<ClothingItemDTO> findAllProjectedBy();   // ← method name can be anything
}

