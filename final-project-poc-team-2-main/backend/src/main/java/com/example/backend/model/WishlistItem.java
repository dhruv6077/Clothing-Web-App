package com.example.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "wishlist_item",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"wishlist_id", "clothing_item_id"})) // optional: never add the same item twice
public class WishlistItem {

    @Id @GeneratedValue
    private Long id;


    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "wishlist_id", nullable = false)
    private Wishlist wishlist;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "clothing_item_id", nullable = false)
    private ClothingItem clothingItem;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Wishlist getWishlist() { return wishlist; }
    public void setWishlist(Wishlist wishlist) { this.wishlist = wishlist; }

    public ClothingItem getClothingItem() { return clothingItem; }
    public void setClothingItem(ClothingItem clothingItem) { this.clothingItem = clothingItem; }
}