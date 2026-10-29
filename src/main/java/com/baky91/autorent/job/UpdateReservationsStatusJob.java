package com.baky91.autorent.job;

import com.baky91.autorent.model.Reservation;
import com.baky91.autorent.repository.ReservationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class UpdateReservationsStatusJob {

    private final ReservationRepository reservationRepository;

    public UpdateReservationsStatusJob(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    // Mettre à jour le status des réservation tous les jours à 18h
    @Scheduled(cron = "0 0 18 * * ?")
    public void updateReservationsStatus() {
        // Définir le statut à 'COMPLETED' toutes les réservations ayant le statut 'CONFIRMED' et dont dateFin <= today
        int updated = reservationRepository.markConfirmedReservationAsCompleted(
                Reservation.Status.CONFIRMED,
                Reservation.Status.COMPLETED,
                LocalDate.now()
        );

        System.out.println(updated + " reservations marqued as 'COMPLETED'.");
    }

}
