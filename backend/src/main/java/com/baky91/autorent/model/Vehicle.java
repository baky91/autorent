package com.baky91.autorent.model;

import com.baky91.autorent.dto.VehicleDTO;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "vehicles")
public class Vehicle {
    public enum Category {
        SUPERMINI,
        COMPACT,
        SUV,
        COMMERCIAL
    }

    public enum FuelType {
        PETROL,
        DIESEL,
        ELECTRIC,
        HYBRID
    }

    public enum Transmission {
        MANUAL,
        AUTOMATIC
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String brand;

    private String model;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private Category category;

    private Integer year;

    @Column(name = "horse_power")
    private Integer horsePower;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "seats_count")
    private Integer seatsCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type")
    private FuelType fuelType;

    @Enumerated(EnumType.STRING)
    @Column(name = "transmission")
    private Transmission transmission;

    private Integer kilometrage;

    @Column(name = "daily_price")
    private BigDecimal dailyPrice;

    @Column(name = "is_active")
    private Boolean active;

    // CONSTRUCTORS
    public Vehicle() {}

    public Vehicle(
        String brand,
        String model,
        Category category,
        Integer year,
        String imagePath,
        Integer seatsCount,
        FuelType fuelType,
        Transmission transmission,
        Integer kilometrage,
        BigDecimal dailyPrice,
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

    public Integer getHorsePower() {
        return horsePower;
    }

    public void setHorsePower(Integer horsePower) {
        this.horsePower = horsePower;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
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

    public FuelType getFuelType() {
        return fuelType;
    }

    public void setFuelType(FuelType fuelType) {
        this.fuelType = fuelType;
    }

    public Transmission getTransmission() {
        return transmission;
    }

    public void setTransmission(Transmission transmission) {
        this.transmission = transmission;
    }

    public Integer getKilometrage() {
        return kilometrage;
    }

    public void setKilometrage(Integer kilometrage) {
        this.kilometrage = kilometrage;
    }

    public BigDecimal getDailyPrice() {
        return dailyPrice;
    }

    public void setDailyPrice(BigDecimal dailyPrice) {
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
            horsePower,
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
