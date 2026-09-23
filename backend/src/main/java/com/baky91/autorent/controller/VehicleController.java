package com.baky91.autorent.controller;

import com.baky91.autorent.dto.VehicleDTO;
import com.baky91.autorent.model.Vehicle;
import com.baky91.autorent.model.exception.ObjectNotFoundException;
import com.baky91.autorent.service.VehicleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService){
        this.vehicleService = vehicleService;
    }

    /* CREATE (POST) */

    @PostMapping
    public String createVehicle(@RequestBody VehicleDTO.PostInput data) {
        Vehicle vehicle = vehicleService.createVehicle(data);
        return "Le véhicule a été crée avec l'identifiant %d.".formatted(vehicle.getId());
    }

    /* READ (GET) */

    @GetMapping
    public List<VehicleDTO.GetOutput> getAllVehicles() {
        return vehicleService.getAllVehicles();
    }

    @GetMapping("/{id}")
    public VehicleDTO.GetOutput getVehicle(@PathVariable Long id) throws ObjectNotFoundException {
        return vehicleService.getVehicleById(id);
    }

    /* UPDATE (PUT) */

    /* DELETE (DELETE) */

}
