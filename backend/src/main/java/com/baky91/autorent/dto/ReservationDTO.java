package com.baky91.autorent.dto;

import com.baky91.autorent.model.Reservation;
import com.baky91.autorent.model.User;
import com.baky91.autorent.model.Vehicle;

import java.time.LocalDate;

public class ReservationDTO {

    public record GetOutput(
        UserDTO.GetOutput user,
        VehicleDTO.GetOutput vehicle,
        LocalDate startDate,
        LocalDate endDate,
        Double totalPrice,
        Reservation.Status status
    ) {}

}
