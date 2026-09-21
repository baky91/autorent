package com.baky91.autorent.dto;

import com.baky91.autorent.model.Reservation;

import java.time.LocalDate;

public class ReservationDTO {

    public record GetOutput(
        Long id,
        UserDTO.GetOutput user,
        VehicleDTO.GetOutput vehicle,
        LocalDate startDate,
        LocalDate endDate,
        Double totalPrice,
        Reservation.Status status
    ) {}

}
