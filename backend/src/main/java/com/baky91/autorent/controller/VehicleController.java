package com.baky91.autorent.controller;

import com.baky91.autorent.model.Vehicle;
import com.baky91.autorent.model.exception.VehicleNotFoundException;
import com.baky91.autorent.service.VehicleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vehicle")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService){
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public Vehicle getVehicle(@RequestParam Integer id) throws VehicleNotFoundException {
        Vehicle vehicle = vehicleService.getVehicleById(id);
        return vehicle;
    }

}
