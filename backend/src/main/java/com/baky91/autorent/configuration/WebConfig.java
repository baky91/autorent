package com.baky91.autorent.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//@Configuration
public class WebConfig implements WebMvcConfigurer {

   // Servir automatiquement les fichiers statiques (images, etc.) placés dans src/main/resources/static/
   @Override
   public void addResourceHandlers(ResourceHandlerRegistry registry) {
       registry.addResourceHandler("/assets/**")
               .addResourceLocations("classpath:/static/assets/");
   }

   // Autoriser le frontend à interroger l'API Spring Boot (CORS)
   @Override
   public void addCorsMappings(CorsRegistry registry) {
       registry.addMapping("/**")
               .allowedOrigins("*")
               .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
               .allowedHeaders("*");
   }
}
