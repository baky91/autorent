package com.baky91.autorent.dto;

public class VehicleDTO {

    public record GetOutput (
        Long id,
        String brand,
        String model,
        String category,
        Integer year,
        String imageUrl,
        Integer seatsCount,
        String fuelType,
        String transmission,
        Integer kilometrage,
        Double dailyPrice,
        Boolean active
    ) {}

}
