package com.baky91.autorent.repository;

import com.baky91.autorent.model.Reservation;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserIdOrderByStartDateDesc(Long userId);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Reservation r " +
           "WHERE r.vehicle.id = :vehicleId " +
           "AND r.status = 'CONFIRMED' " +
           "AND r.startDate <= :endDate " +
           "AND r.endDate >= :startDate")
    boolean existsConflictingReservation(@Param("vehicleId") Long vehicleId, 
                                         @Param("startDate") LocalDate startDate, 
                                         @Param("endDate") LocalDate endDate);
    @Query("SELECT r FROM Reservation r WHERE r.vehicle.id = :vehicleId " +
           "AND r.status = 'CONFIRMED' " +
           "AND r.endDate >= :today")
    List<Reservation> findActiveReservationsForVehicleFromDate(@Param("vehicleId") Long vehicleId, 
                                                               @Param("today") LocalDate today);

    @Transactional
    @Modifying
    @Query("UPDATE Reservation r SET r.status = :newStatus WHERE r.status = :oldStatus AND r.endDate <= :today")
    int markConfirmedReservationAsCompleted(
            @Param("oldStatus") Reservation.Status oldStatus,
            @Param("newStatus") Reservation.Status newStatus,
            @Param("today") LocalDate today
    );
}
