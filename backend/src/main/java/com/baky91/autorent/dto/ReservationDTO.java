package com.baky91.autorent.dto;

import com.baky91.autorent.model.Reservation;
import com.baky91.autorent.model.User;
import com.baky91.autorent.model.Vehicle;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReservationDTO {

    public record CreateInput(
        Long vehicleId,
        LocalDate startDate,
        LocalDate endDate
    ) {}

    public record EditInput(
        Long userId,
        Long vehicleId,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalPrice,
        Reservation.Status status
    ) {}

    public record Output(
        Long id,
        UserDTO.Output user,
        VehicleDTO.Output vehicle,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalPrice,
        Reservation.Status status,
        LocalDateTime createdAt
    ) {}

}
