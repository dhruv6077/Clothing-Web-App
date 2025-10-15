// backend/src/main/java/com/example/backend/dto/ClothingItemDTO.java
package com.example.backend.dto;

public interface ClothingItemDTO {
    Long   getId();
    String getName();
    String getDescription();
    String getColor();
    String getPattern();
    String getMaterial();
    String getEstimatedPricing();
    String getGender();
    String getEvents();
    String getTypeOfClothing();
    String getImageUrl();
}
