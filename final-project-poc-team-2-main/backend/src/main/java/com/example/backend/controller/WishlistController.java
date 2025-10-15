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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.WishListDTO;
import com.example.backend.model.User;
import com.example.backend.model.Wishlist;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WishlistRepository;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/users/{userId}/wishlists")
public class WishlistController {

    private final WishlistRepository wishlistRepo;
    private final UserRepository userRepo;

    @Autowired
    public WishlistController(WishlistRepository wishlistRepo,
                              UserRepository userRepo) {
        this.wishlistRepo = wishlistRepo;
        this.userRepo = userRepo;
    }

    /* ---------- READ ---------- */
    
    // GET /users/{userId}/wishlists
    @GetMapping
    public ResponseEntity<List<WishListDTO>> list(@PathVariable Long userId) {
        if (!userRepo.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(wishlistRepo.findByUserId(userId));
    }

    // GET /users/{userId}/wishlists/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Wishlist> get(@PathVariable Long userId,
                                        @PathVariable Long id) {
        return wishlistRepo.findById(id)
                .filter(w -> w.getUser().getId().equals(userId))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /* ---------- CREATE ---------- */

    // POST /users/{userId}/wishlists
    @PostMapping
    public ResponseEntity<Wishlist> create(@PathVariable Long userId,
                                           @RequestBody Wishlist incoming) {

        User user = userRepo.findById(userId)
                            .orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        incoming.setId(null);       // ensure INSERT, not accidental update
        incoming.setUser(user);

        Wishlist saved = wishlistRepo.save(incoming);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /* ---------- UPDATE ---------- */

    // PUT /users/{userId}/wishlists/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Wishlist> update(@PathVariable Long userId,
                                           @PathVariable Long id,
                                           @RequestBody Wishlist incoming) {

        return wishlistRepo.findById(id)
                .filter(w -> w.getUser().getId().equals(userId))
                .map(existing -> {
                    incoming.setId(id);
                    incoming.setUser(existing.getUser());   // keep owner
                    Wishlist updated = wishlistRepo.save(incoming);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    // DELETE /users/{userId}/wishlists/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long userId,
                                       @PathVariable Long id) {
        return wishlistRepo.findById(id)
                .filter(w -> w.getUser().getId().equals(userId))
                .map(wishlist -> {
                    wishlistRepo.delete(wishlist);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
