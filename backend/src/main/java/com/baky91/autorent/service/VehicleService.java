package com.baky91.autorent.service;

import com.baky91.autorent.dto.VehicleDTO;
import com.baky91.autorent.model.Vehicle;
import com.baky91.autorent.model.exception.VehicleNotFoundException;
import com.baky91.autorent.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository){
        this.vehicleRepository = vehicleRepository;
    }

    public Vehicle getVehicleById(int id) throws VehicleNotFoundException {
        return vehicleRepository.findById(id)
                                .orElseThrow(() -> new VehicleNotFoundException("Le véhicule numéro %d n'a pas été trouvé".formatted(id)));
    }

    public List<VehicleDTO.GetOutput> getAllVehicles() {
        return vehicleRepository.findAll()
                                .stream()
                                .map(Vehicle::toDto)
                                .toList();
    }
}
