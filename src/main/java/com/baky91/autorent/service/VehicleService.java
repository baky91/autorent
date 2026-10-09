package com.baky91.autorent.service;

import com.baky91.autorent.dto.VehicleDTO;
import com.baky91.autorent.model.Reservation;
import com.baky91.autorent.model.Vehicle;
import com.baky91.autorent.model.exception.ObjectNotFoundException;
import com.baky91.autorent.repository.ReservationRepository;
import com.baky91.autorent.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Stream;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final ReservationRepository reservationRepository;

    public VehicleService(VehicleRepository vehicleRepository, ReservationRepository reservationRepository){
        this.vehicleRepository = vehicleRepository;
        this.reservationRepository = reservationRepository;
    }

    public VehicleDTO.Output getVehicleById(long id) throws ObjectNotFoundException {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Le véhicule numéro %d n'a pas été trouvé".formatted(id)));
        return mapToOutputWithAvailability(vehicle);
    }

    public List<VehicleDTO.Output> getAllVehicles(VehicleDTO.QueryParams params) {
        Stream<Vehicle> stream = vehicleRepository.findAll().stream();

        // On ne montre que les véhicules actifs
        stream = stream.filter(Vehicle::getAvailable);

        if (params.category() != null) {
            stream = stream.filter(v -> v.getCategory() == params.category());
        }
        if (params.fuelType() != null) {
            stream = stream.filter(v -> v.getFuelType() == params.fuelType());
        }
        if (params.transmission() != null) {
            stream = stream.filter(v -> v.getTransmission() == params.transmission());
        }
        if (params.maxPrice() != null) {
            stream = stream.filter(v -> v.getDailyPrice().compareTo(params.maxPrice()) <= 0);
        }
        if (params.startDate() != null || params.endDate() != null) {
            // Si une seule date est fournie, on considère par défaut que c'est une location d'une journée
            LocalDate start = params.startDate() != null ? params.startDate() : params.endDate();
            LocalDate end = params.endDate() != null ? params.endDate() : params.startDate();

            stream = stream.filter(v -> !reservationRepository.existsConflictingReservation(v.getId(), start, end));
        }

        if (params.count() != null && params.count() > 0) {
            stream = stream.limit(params.count());
        }

        return stream.map(this::mapToOutputWithAvailability).toList();
    }

    private VehicleDTO.Output mapToOutputWithAvailability(Vehicle v) {
        LocalDate today = LocalDate.now();
        boolean isCurrentlyAvailable = !reservationRepository.existsConflictingReservation(v.getId(), today, today);
        LocalDate availableFrom = today;

        if (!isCurrentlyAvailable) {
            // On cherche la réservation qui est en cours aujourd'hui
            List<Reservation> activeReservations = reservationRepository.findActiveReservationsForVehicleFromDate(v.getId(), today);
            for (Reservation r : activeReservations) {
                if (!r.getStartDate().isAfter(today) && !r.getEndDate().isBefore(today)) {
                    availableFrom = r.getEndDate().plusDays(1);
                    break;
                }
            }
        }

        return v.toDto(isCurrentlyAvailable, availableFrom);
    }

    public VehicleDTO.Output createVehicle(VehicleDTO.Input data) {
        Vehicle vehicle = new Vehicle(
            data.brand(),
            data.model(),
            data.category(),
            data.year(),
            data.horsePower(),
            data.imagePath(),
            data.seatsCount(),
            data.fuelType(),
            data.transmission(),
            data.kilometrage(),
            data.dailyPrice(),
            data.available()
        );

        vehicleRepository.save(vehicle);
        return vehicle.toDto();
    }

    public VehicleDTO.Output updateVehicle(Long id, VehicleDTO.Input data) {
        Vehicle vehicle = vehicleRepository.findById(id)
                                           .orElseThrow(() -> new ObjectNotFoundException("Le véhicule numéro %d n'a pas été trouvé".formatted(id)));

        vehicle.setBrand(data.brand());
        vehicle.setModel(data.model());
        vehicle.setYear(data.year());
        vehicle.setHorsePower(data.horsePower());
        vehicle.setCategory(data.category());
        vehicle.setImagePath(data.imagePath());
        vehicle.setSeatsCount(data.seatsCount());
        vehicle.setFuelType(data.fuelType());
        vehicle.setTransmission(data.transmission());
        vehicle.setKilometrage(data.kilometrage());
        vehicle.setDailyPrice(data.dailyPrice());
        vehicle.setAvailable(data.available());

        vehicleRepository.save(vehicle);

        return vehicle.toDto();
    }

    public void deleteVehicle(Long id) throws ObjectNotFoundException {
        Vehicle foundVehicle = vehicleRepository.findById(id)
                                                .orElseThrow(() -> new ObjectNotFoundException("Le véhicule numéro %d n'a pas été trouvé".formatted(id)));
        vehicleRepository.delete(foundVehicle);
    }
}
