package com.baky91.autorent.dto;

import com.baky91.autorent.model.Reservation;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReservationDTO {

    public record CreateInput(
        Long vehicleId,
        LocalDate startDate,
        LocalDate endDate
    ) {}

    public record ChangeStatusInput(
        Long resId,
        Reservation.Status status
    ) {}

    public record Output(
        Long id,
        UserDTO.Output user,
        VehicleDTO.Output vehicle,
        LocalDate startDate,
        LocalDate endDate,
        Double totalPrice,
        Reservation.Status status,
        LocalDateTime createdAt
    ) {}

}
