package com.baky91.autorent.model;

import com.baky91.autorent.dto.VehicleDTO;
import jakarta.persistence.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String brand;

    private String model;

    private String category;

    private Integer year;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "seats_count")
    private Integer seatsCount;

    @Column(name = "fuel_type")
    private String fuelType;

    private String transmission;

    private Integer kilometrage;

    @Column(name = "daily_price")
    private Double dailyPrice;

    @Column(name = "is_active")
    private Boolean active;

    // CONSTRUCTORS
    public Vehicle() {}

    public Vehicle(
        String brand,
        String model,
        String category,
        Integer year,
        String imagePath,
        Integer seatsCount,
        String fuelType,
        String transmission,
        Integer kilometrage,
        Double dailyPrice,
        Boolean active
    ) {
        this.brand = brand;
        this.model = model;
        this.category = category;
        this.year = year;
        this.imagePath = imagePath;
        this.seatsCount = seatsCount;
        this.fuelType = fuelType;
        this.transmission = transmission;
        this.kilometrage = kilometrage;
        this.dailyPrice = dailyPrice;
        this.active = active;
    }

    // GETTERS AND SETTERS

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public Integer getSeatsCount() {
        return seatsCount;
    }

    public void setSeatsCount(Integer seatsCount) {
        this.seatsCount = seatsCount;
    }

    public String getFuelType() {
        return fuelType;
    }

    public void setFuelType(String fuelType) {
        this.fuelType = fuelType;
    }

    public String getTransmission() {
        return transmission;
    }

    public void setTransmission(String transmission) {
        this.transmission = transmission;
    }

    public Integer getKilometrage() {
        return kilometrage;
    }

    public void setKilometrage(Integer kilometrage) {
        this.kilometrage = kilometrage;
    }

    public Double getDailyPrice() {
        return dailyPrice;
    }

    public void setDailyPrice(Double dailyPrice) {
        this.dailyPrice = dailyPrice;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public VehicleDTO.GetOutput toDto(){
        return new VehicleDTO.GetOutput(
            id,
            brand,
            model,
            category,
            year,
            imagePath,
            seatsCount,
            fuelType,
            transmission,
            kilometrage,
            dailyPrice,
            active
        );
    }

}
