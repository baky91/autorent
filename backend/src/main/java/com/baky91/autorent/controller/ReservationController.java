package com.baky91.autorent.controller;

import com.baky91.autorent.dto.ReservationDTO;
import com.baky91.autorent.model.exception.ObjectNotFoundException;
import com.baky91.autorent.service.ReservationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService){
        this.reservationService = reservationService;
    }

    /* CREATE (POST) */

    /* READ (GET) */

    @GetMapping
    public List<ReservationDTO.Output> getAllReservations() {
        return reservationService.getAllReservations();
    }

    @GetMapping("/{id}")
    public ReservationDTO.Output getReservation(@PathVariable Long id) throws ObjectNotFoundException {
        return reservationService.getReservationById(id);
    }

    /* UPDATE (PUT) */

    /* DELETE (DELETE) */

}
