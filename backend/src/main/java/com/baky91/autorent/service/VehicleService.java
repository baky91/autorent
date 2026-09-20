package com.baky91.autorent.service;

import com.baky91.autorent.model.Vehicle;
import com.baky91.autorent.model.exception.VehicleNotFoundException;
import com.baky91.autorent.repository.VehicleRepository;
import org.springframework.stereotype.Service;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository){
        this.vehicleRepository = vehicleRepository;
    }

    public Vehicle getVehicleById(int id) throws VehicleNotFoundException {
        Vehicle vehicle = vehicleRepository.getReferenceById(id);

        if (vehicle == null){
            throw new VehicleNotFoundException("Le véhicule n°%d n'a pas été trouvé".formatted(id));
        }

        return vehicle;

    }

}
