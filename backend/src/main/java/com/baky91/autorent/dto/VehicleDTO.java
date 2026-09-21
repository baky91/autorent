package com.baky91.autorent.dto;

import com.baky91.autorent.model.Vehicle;

public class VehicleDTO {

    public record GetOutput (
        Long id,
        String brand,
        String model,
        Vehicle.Category category,
        Integer year,
        String imageUrl,
        Integer seatsCount,
        Vehicle.FuelType fuelType,
        Vehicle.Transmission transmission,
        Integer kilometrage,
        Double dailyPrice,
        Boolean active
    ) {}

}
