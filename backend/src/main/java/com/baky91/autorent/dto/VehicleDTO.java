package com.baky91.autorent.dto;

import com.baky91.autorent.model.Vehicle;

import java.math.BigDecimal;

public class VehicleDTO {

    public record GetOutput (
        Long id,
        String brand,
        String model,
        Vehicle.Category category,
        Integer year,
        Integer horsePower,
        String imagePath,
        Integer seatsCount,
        Vehicle.FuelType fuelType,
        Vehicle.Transmission transmission,
        Integer kilometrage,
        BigDecimal dailyPrice,
        Boolean active
    ) {}

}
