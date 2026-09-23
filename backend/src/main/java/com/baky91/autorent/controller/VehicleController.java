package com.baky91.autorent.controller;

import com.baky91.autorent.dto.VehicleDTO;
import com.baky91.autorent.model.exception.ObjectNotFoundException;
import com.baky91.autorent.service.VehicleService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
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
    public ResponseEntity<VehicleDTO.Output> insertVehicle(@RequestBody VehicleDTO.PostInput data) {
        VehicleDTO.Output createdVehicle = vehicleService.createVehicle(data);

        // Construit l'URI de la nouvelle ressource : /api/vehicles/{id}
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                                                  .path("/{id}")
                                                  .buildAndExpand(createdVehicle.id())
                                                  .toUri();
        return ResponseEntity.created(location).body(createdVehicle);
    }

    /* READ (GET) */

    @GetMapping
    public List<VehicleDTO.Output> getAllVehicles() {
        return vehicleService.getAllVehicles();
    }

    @GetMapping("/{id}")
    public VehicleDTO.Output getVehicle(@PathVariable Long id) throws ObjectNotFoundException {
        return vehicleService.getVehicleById(id);
    }

    /* UPDATE (PUT) */

    @PutMapping
    public VehicleDTO.Output updateVehicle(@RequestBody @Validated VehicleDTO.PutInput data) {
        return vehicleService.updateVehicle(data);
    }

    /* DELETE (DELETE) */

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

}
