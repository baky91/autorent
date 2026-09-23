package com.baky91.autorent.service;

import com.baky91.autorent.dto.VehicleDTO;
import com.baky91.autorent.model.Vehicle;
import com.baky91.autorent.model.exception.ObjectNotFoundException;
import com.baky91.autorent.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository){
        this.vehicleRepository = vehicleRepository;
    }

    public VehicleDTO.Output getVehicleById(long id) throws ObjectNotFoundException {
        return vehicleRepository.findById(id)
                                .map(Vehicle::toDto)
                                .orElseThrow(() -> new ObjectNotFoundException("Le véhicule numéro %d n'a pas été trouvé".formatted(id)));
    }

    public List<VehicleDTO.Output> getAllVehicles() {
        return vehicleRepository.findAll()
                                .stream()
                                .map(Vehicle::toDto)
                                .toList();
    }

    public VehicleDTO.Output createVehicle(VehicleDTO.PostInput data) {
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
            data.active()
        );

        vehicleRepository.save(vehicle);
        return vehicle.toDto();
    }

    public void deleteVehicle(Long id) throws ObjectNotFoundException {
        Vehicle foundVehicle = vehicleRepository.findById(id)
                                                .orElseThrow(() -> new ObjectNotFoundException("Le véhicule numéro %d n'a pas été trouvé".formatted(id)));
        vehicleRepository.delete(foundVehicle);
    }
}
