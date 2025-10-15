package com.example.backend.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clothing_item")
public class ClothingItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "color")
    private String color;

    @Column(name = "pattern")
    private String pattern;

    @Column(name = "material")
    private String material;

    @Column(name = "estimated_pricing")
    private String estimatedPricing;

    @Column(name = "gender")
    private String gender;

    @Column(name = "events")
    private String events;

    @Column(name = "type_of_clothing")
    private String typeOfClothing;

    @Column(name = "image_url")
    private String imageUrl;


    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }


    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getPattern() { return pattern; }
    public void setPattern(String pattern) { this.pattern = pattern; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getEstimatedPricing() { return estimatedPricing; }
    public void setEstimatedPricing(String estimatedPricing) { this.estimatedPricing = estimatedPricing; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getEvents() { return events; }
    public void setEvents(String events) { this.events = events; }

    public String getTypeOfClothing() { return typeOfClothing; }
    public void setTypeOfClothing(String typeOfClothing) { this.typeOfClothing = typeOfClothing; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

   

}