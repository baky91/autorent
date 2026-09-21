package com.baky91.autorent.service;

import com.baky91.autorent.dto.ReservationDTO;
import com.baky91.autorent.model.Reservation;
import com.baky91.autorent.model.User;
import com.baky91.autorent.model.exception.ObjectNotFoundException;
import com.baky91.autorent.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public ReservationService(ReservationRepository reservationRepository){
        this.reservationRepository = reservationRepository;
    }

    public ReservationDTO.GetOutput getReservationById(Long id) {
        return reservationRepository.findById(id)
                                    .map(Reservation::toDto)
                                    .orElseThrow(() -> new ObjectNotFoundException("La réservation numéro %d n'a pas été trouvé".formatted(id)));
    }

    public List<ReservationDTO.GetOutput> getAllReservations() {
        return reservationRepository.findAll()
                                    .stream()
                                    .map(Reservation::toDto)
                                    .toList();
    }

}
