package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.dto.WishListDTO;
import com.example.backend.model.Wishlist;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<WishListDTO> findByUserId(Long userId);
}
