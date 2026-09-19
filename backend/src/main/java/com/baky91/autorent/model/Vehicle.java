package com.baky91.autorent.model;

import jakarta.persistence.*;

@Entity
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String brand;
    private String model;
    private String category;
    private Integer year;
    private String image_url;
    private Integer seats_count;
    private String fuel_type;
    private String transmission;
    private Integer kilometrage;
    private Double daily_price;
    private Boolean is_active;

    // CONSTRUCTORS

    public Vehicle(){

    }

    public Vehicle(
        String brand,
        String model,
        String category,
        Integer year,
        String image_url,
        Integer seats_count,
        String fuel_type,
        String transmission,
        Integer kilometrage,
        Double daily_price,
        Boolean is_active
    ) {
        this.brand = brand;
        this.model = model;
        this.category = category;
        this.year = year;
        this.image_url = image_url;
        this.seats_count = seats_count;
        this.fuel_type = fuel_type;
        this.transmission = transmission;
        this.kilometrage = kilometrage;
        this.daily_price = daily_price;
        this.is_active = is_active;
    }

    // GETTERS AND SETTERS
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
}
