package com.baky91.autorent.configuration;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.LocalDate;

@Converter(autoApply = true)
public class LocalDateConverter implements AttributeConverter<LocalDate, String> {

    @Override
    public String convertToDatabaseColumn(LocalDate date) {
        if (date == null) {
            return null;
        }
        // Force le format attendu par la base de données : "YYYY-MM-DD 00:00:00"
        return date.toString() + " 00:00:00";
    }

    @Override
    public LocalDate convertToEntityAttribute(String dateString) {
        if (dateString == null) {
            return null;
        }
        // Récupère uniquement la partie "YYYY-MM-DD" si la chaîne contient une heure
        return LocalDate.parse(dateString.split(" ")[0]);
    }
}
