package com.example.backend.dto;

import com.example.backend.model.WishlistItem;

public record WishListItemDTO(Long id, Long wishlistId, Long clothingItemId) {
    public static WishListItemDTO from(WishlistItem item) {
        return new WishListItemDTO(
            item.getId(),
            item.getWishlist().getId(),
            item.getClothingItem().getId()
        );
    }
}
