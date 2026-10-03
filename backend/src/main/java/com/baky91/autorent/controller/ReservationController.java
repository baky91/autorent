package com.baky91.autorent.controller;

import com.baky91.autorent.dto.ReservationDTO;
import com.baky91.autorent.model.User;
import com.baky91.autorent.model.exception.ObjectNotFoundException;
import com.baky91.autorent.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService){
        this.reservationService = reservationService;
    }

    /* CREATE (POST) */

    @PostMapping("/me")
    public ReservationDTO.Output createReservation(Authentication authentication, @Valid @RequestBody ReservationDTO.CreateInput input) throws Exception {
        User user = (User) authentication.getPrincipal();
        // Si l'utilisateur n'est pas authentifié, il y aura une erreur 401 Unauthorized automatiquement envoyée

        return reservationService.createReservation(null, user, input);
    }

    /* READ (GET) */

    @GetMapping
    public List<ReservationDTO.Output> getAllReservations() {
        return reservationService.getAllReservations();
    }

    @GetMapping("/me")
    public List<ReservationDTO.Output> getMyReservations(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        // Si l'utilisateur n'est pas authentifié, il y aura une erreur 401 Unauthorized automatiquement envoyée

        return reservationService.getReservationsByUserId(user.getId());
    }

    @GetMapping("/{id}")
    public ReservationDTO.Output getReservation(@PathVariable Long id) throws ObjectNotFoundException {
        return reservationService.getReservationById(id);
    }

    /* UPDATE (PUT) */

    /* DELETE (DELETE) */

}
