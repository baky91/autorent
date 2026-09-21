package com.baky91.autorent.controller;

import com.baky91.autorent.dto.VehicleDTO;
import com.baky91.autorent.model.exception.VehicleNotFoundException;
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

    /* READ (GET) */

    @GetMapping
    public List<VehicleDTO.GetOutput> getAllVehicles() {
        return vehicleService.getAllVehicles();
    }

    @GetMapping("/{id}")
    public VehicleDTO.GetOutput getVehicle(@PathVariable Long id) throws VehicleNotFoundException {
        return vehicleService.getVehicleById(id).toDto();
    }

    /* UPDATE (PUT) */

    /* DELETE (DELETE) */

}
