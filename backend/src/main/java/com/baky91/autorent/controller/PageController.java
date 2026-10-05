package com.baky91.autorent.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/vehicles")
    public String vehiclesPage() {
        return "forward:/vehicles.html";
    }

    @GetMapping("/reservations")
    public String reservationsPage() {
        return "forward:/reservations.html";
    }

}
