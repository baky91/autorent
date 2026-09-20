package com.baky91.autorent.controller;

import com.baky91.autorent.dto.VehicleDTO;
import com.baky91.autorent.model.Vehicle;
import com.baky91.autorent.model.exception.VehicleNotFoundException;
import com.baky91.autorent.service.VehicleService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService){
        this.vehicleService = vehicleService;
    }

    @GetMapping("/{id}")
    public VehicleDTO.GetOutput getVehicle(@PathVariable Integer id) throws VehicleNotFoundException {
        Vehicle vehicle = vehicleService.getVehicleById(id);
        return vehicle.toDto();
    }

}
