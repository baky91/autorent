package com.baky91.autorent.job;

import com.baky91.autorent.model.Reservation;
import com.baky91.autorent.repository.ReservationRepository;
import com.baky91.autorent.service.VehicleService;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class UpdateReservationsStatusJob {

    private final ReservationRepository reservationRepository;

    private final CacheManager cacheManager;

    public UpdateReservationsStatusJob(ReservationRepository reservationRepository, CacheManager cacheManager) {
        this.reservationRepository = reservationRepository;
        this.cacheManager = cacheManager;
    }

    // La disponibilité d'un véhicule dépend de la date du jour (isCurrentlyAvailable, availableFrom) :
    // on vide le cache chaque nuit pour ne pas servir les valeurs de la veille.
    @Scheduled(cron = "0 0 0 * * ?")
    public void clearVehiclesCache() {
        Cache cache = cacheManager.getCache(VehicleService.VEHICLES_CACHE);
        if (cache != null) {
            cache.clear();
        }
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
