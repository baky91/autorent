package com.baky91.autorent.dto;

import com.baky91.autorent.model.Vehicle;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public class VehicleDTO {

    public record Input(
        @NotBlank(message = "Veuillez renseigner la marque")
        String brand,

        @NotBlank(message = "Veuillez renseigner le modèle")
        String model,

        @NotNull
        Vehicle.Category category,

        @NotNull
        Integer year,

        @NotNull
        @Positive(message = "La valeur de la puissance doit être strictement positive")
        Integer horsePower,

        @NotNull
        String imagePath,

        @NotNull
        @Positive(message = "Le nombre de sièges doit être strictement positif")
        Integer seatsCount,

        @NotNull
        Vehicle.FuelType fuelType,

        @NotNull
        Vehicle.Transmission transmission,

        @NotNull
        @PositiveOrZero(message = "Le kilométrage doit être positif")
        Integer kilometrage,

        @NotNull
        @PositiveOrZero(message = "Le prix journalier doit être positif")
        BigDecimal dailyPrice,

        @NotNull
        Boolean active
    ) {}

    public record Output(
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
