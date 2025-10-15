package com.example.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.ClothingItem;
import com.example.backend.model.Wishlist;
import com.example.backend.model.WishlistItem;
import com.example.backend.repository.ClothingItemRepository;
import com.example.backend.repository.WishlistItemRepository;
import com.example.backend.repository.WishlistRepository;
import com.example.backend.dto.WishListItemDTO;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/users/{userId}/wishlists/{wishlistId}/items")
public class WishlistItemController {

    private final WishlistRepository wishlistRepo;
    private final WishlistItemRepository itemRepo;
    private final ClothingItemRepository clothingRepo;

    @Autowired
    public WishlistItemController(WishlistRepository wishlistRepo,
                                  WishlistItemRepository itemRepo,
                                  ClothingItemRepository clothingRepo) {
        this.wishlistRepo = wishlistRepo;
        this.itemRepo = itemRepo;
        this.clothingRepo = clothingRepo;
    }

    // GET ALL ITEMS IN A WISHLIST
    // GET /users/{userId}/wishlists/{wishlistId}/items
    @GetMapping
public ResponseEntity<List<WishListItemDTO>> list(@PathVariable Long userId,
                                                  @PathVariable Long wishlistId) {
    return wishlistRepo.findById(wishlistId)
        .filter(w -> w.getUser().getId().equals(userId))
        .map(w -> {
            List<WishListItemDTO> dtoList = itemRepo.findByWishlistId(wishlistId)
                .stream()
                .map(WishListItemDTO::from)
                .toList();
            return ResponseEntity.ok(dtoList);
        })
        .orElse(ResponseEntity.notFound().build());
}



    // Get a single item in a wishlist (DONT USE RIGHT NOW)
    // GET /users/{userId}/wishlists/{wishlistId}/items/{id}
    @GetMapping("/{id}")
public ResponseEntity<WishListItemDTO> get(@PathVariable Long userId,
                                           @PathVariable Long wishlistId,
                                           @PathVariable Long id) {
    return itemRepo.findById(id)
        .filter(it -> it.getWishlist().getId().equals(wishlistId) &&
                      it.getWishlist().getUser().getId().equals(userId))
        .map(WishListItemDTO::from)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
}



    // POST /users/{userId}/wishlists/{wishlistId}/items
    // Body: { "clothingItemId": 123 }
    @PostMapping
public ResponseEntity<WishListItemDTO> create(@PathVariable Long userId,
                                              @PathVariable Long wishlistId,
                                              @RequestBody CreateItemRequest body) {

    Wishlist wishlist = wishlistRepo.findById(wishlistId)
            .filter(w -> w.getUser().getId().equals(userId))
            .orElse(null);

    if (wishlist == null) return ResponseEntity.notFound().build();

    ClothingItem clothing = clothingRepo.findById(body.clothingItemId()).orElse(null);
    if (clothing == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

    WishlistItem item = new WishlistItem();
    item.setWishlist(wishlist);
    item.setClothingItem(clothing);

    WishlistItem saved = itemRepo.save(item);
    return ResponseEntity.status(HttpStatus.CREATED).body(WishListItemDTO.from(saved));
}
    // DELETE /users/{userId}/wishlists/{wishlistId}/items/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long userId,
                                       @PathVariable Long wishlistId,
                                       @PathVariable Long id) {
        return itemRepo.findById(id)
            .filter(item -> item.getWishlist().getId().equals(wishlistId) &&
                            item.getWishlist().getUser().getId().equals(userId))
            .map(item -> {
                itemRepo.delete(item);
                return ResponseEntity.noContent().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
    

    
    public static record CreateItemRequest(Long clothingItemId) {}
}
