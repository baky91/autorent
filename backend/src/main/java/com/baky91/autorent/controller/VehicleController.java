package com.baky91.autorent.controller;

import com.baky91.autorent.model.Vehicle;
import com.baky91.autorent.repository.VehicleRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class VehicleController {

    private final VehicleRepository vehicleRepository;

    public VehicleController(VehicleRepository vehicleRepository){
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping("/vehicle")
    public String getVehicle(@RequestParam Integer id){
        Vehicle vehicle = vehicleRepository.getReferenceById(id);
        System.out.println(vehicle.toString());

        if (vehicle != null){
            return "Le véhicule n°%d a été trouvé : %s %s (%d)".formatted(id, vehicle.getBrand(), vehicle.getModel(), vehicle.getYear());
        } else {
            return "Le véhicule n°%d n'a pas été trouvé".formatted(id);
        }

    }

}
