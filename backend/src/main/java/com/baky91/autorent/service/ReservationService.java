package com.baky91.autorent.service;

import com.baky91.autorent.dto.ReservationDTO;
import com.baky91.autorent.model.Reservation;
import com.baky91.autorent.model.User;
import com.baky91.autorent.model.Vehicle;
import com.baky91.autorent.model.exception.ObjectNotFoundException;
import com.baky91.autorent.model.exception.ReservationConflictException;
import com.baky91.autorent.repository.ReservationRepository;
import com.baky91.autorent.repository.UserRepository;
import com.baky91.autorent.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    public ReservationService(ReservationRepository reservationRepository, UserRepository userRepository, VehicleRepository vehicleRepository){
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public ReservationDTO.Output getReservationById(Long id) {
        return reservationRepository.findById(id)
                                    .map(Reservation::toDto)
                                    .orElseThrow(() -> new ObjectNotFoundException("La réservation numéro %d n'a pas été trouvé".formatted(id)));
    }

    public List<ReservationDTO.Output> getAllReservations() {
        return reservationRepository.findAll()
                                    .stream()
                                    .map(Reservation::toDto)
                                    .toList();
    }

    public List<ReservationDTO.Output> getReservationsByUserId(Long userId) {
        return reservationRepository.findByUserId(userId)
                                    .stream()
                                    .map(Reservation::toDto)
                                    .toList();
    }

    public ReservationDTO.Output createReservation(Long id, User user, ReservationDTO.CreateInput input) {
        // Si on a déjà un objet User on peut le passer directement en paramètre et éviter de faire une recherche dans la BDD à partir de l'id
        Optional<User> currentUser = null;

        if (id == null && user != null) {
            currentUser = Optional.of(user);
        }

        if (user == null && id != null) {
            currentUser = userRepository.findById(id);
        }

        if (!currentUser.isPresent()) {
            throw new ObjectNotFoundException("L'utilisateur %d n'a pas été trouvé".formatted(id));
        }

        Vehicle vehicle = vehicleRepository.findById(input.vehicleId())
                                           .orElseThrow(() -> new ObjectNotFoundException("Le véhicule numéro %d n'a pas été trouvé".formatted(input.vehicleId())));

        // Vérification logique des dates
        if (input.startDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La date de début ne peut pas être dans le passé.");
        }
        if (input.endDate().isBefore(input.startDate())) {
            throw new IllegalArgumentException("La date de fin ne peut pas être antérieure à la date de début.");
        }

        // Vérification qu'il n'y a aucun conflit de réservation
        boolean hasConflict = reservationRepository.existsConflictingReservation(vehicle.getId(), input.startDate(), input.endDate());
        
        if (hasConflict) {
            throw new ReservationConflictException("Le véhicule n'est pas disponible pour les dates sélectionnées.");
        }

        // Calcul du prix de la réservation
        long days = java.time.temporal.ChronoUnit.DAYS.between(input.startDate(), input.endDate()) + 1;
        BigDecimal totalPrice = vehicle.getDailyPrice().multiply(BigDecimal.valueOf(days));

        // Créer la réservation au sauvegarder dans la BDD
        Reservation newReservation = new Reservation(
                currentUser.get(),
                vehicle,
                input.startDate(),
                input.endDate(),
                totalPrice,
                Reservation.Status.CONFIRMED
        );
        reservationRepository.save(newReservation);

        return newReservation.toDto();
    }
}
