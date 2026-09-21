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

    public VehicleDTO.GetOutput getVehicleById(long id) throws ObjectNotFoundException {
        return vehicleRepository.findById(id)
                                .map(Vehicle::toDto)
                                .orElseThrow(() -> new ObjectNotFoundException("Le véhicule numéro %d n'a pas été trouvé".formatted(id)));
    }

    public List<VehicleDTO.GetOutput> getAllVehicles() {
        return vehicleRepository.findAll()
                                .stream()
                                .map(Vehicle::toDto)
                                .toList();
    }
}
