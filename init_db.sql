-- ============================================================================
-- AutoRent - Données initiales (alternative à init_db.py, sans Python)
-- ============================================================================
--
-- ORDRE D'EXÉCUTION
--   1. Lancer le serveur Spring Boot UNE FOIS : Hibernate crée les tables
--      (users, vehicles, reservations) dans data/autorent.db.
--   2. Arrêter le serveur.
--   3. Exécuter ce script sur data/autorent.db, par exemple :
--        sqlite3 data/autorent.db < init_db.sql
--      (commande à lancer depuis la racine du projet, là où se trouve ce fichier)
--      (ou avec « DB Browser for SQLite » : Fichier > Importer, ou onglet
--       « Exécuter le SQL » puis coller le contenu de ce fichier).
--   4. Relancer le serveur (nécessaire : le serveur garde la liste des
--      véhicules en cache mémoire, il ne voit pas les changements faits
--      directement dans la base).
--
-- Ce script ne crée PAS les tables : il ne fait que les vider puis les remplir.
-- Il peut donc être relancé à volonté pour remettre la base à l'état initial.
--
-- Comptes créés (mots de passe hachés avec BCrypt) :
--   admin      / admin123      (ADMIN)
--   alice_m, bob_b, charlie_d, sophie_l / password123   (USER)
-- ============================================================================

BEGIN TRANSACTION;

-- Nettoyage (réservations d'abord : elles référencent users et vehicles)
DELETE FROM reservations;
DELETE FROM users;
DELETE FROM vehicles;

-- ----------------------------------------------------------------------------
-- Véhicules
-- ----------------------------------------------------------------------------
INSERT INTO vehicles (id, brand, model, category, year, horse_power, image_path, seats_count, fuel_type, transmission, kilometrage, daily_price, is_available) VALUES
    -- Citadines
    (1,  'Peugeot',       '208',           'SUPERMINI',  2023, 100, '/assets/images/vehicles/peugeot-208.webp',          5, 'PETROL',   'MANUAL',    18500, 35.00,  1),
    (2,  'Renault',       'Clio V',        'SUPERMINI',  2022, 100, '/assets/images/vehicles/renault-clio.webp',         5, 'DIESEL',   'MANUAL',    32000, 38.00,  1),
    (3,  'Volkswagen',    'Polo VI',       'SUPERMINI',  2023,  95, '/assets/images/vehicles/volkswagen-polo.webp',      5, 'PETROL',   'AUTOMATIC', 12000, 42.00,  1),
    (4,  'Fiat',          '500',           'SUPERMINI',  2022,  70, '/assets/images/vehicles/fiat-500.webp',             4, 'PETROL',   'MANUAL',    25000, 30.00,  1),
    (5,  'Peugeot',       'e-208',         'SUPERMINI',  2024, 136, '/assets/images/vehicles/peugeot-208.webp',          5, 'ELECTRIC', 'AUTOMATIC',  8000, 45.00,  1),
    (6,  'Toyota',        'Yaris',         'SUPERMINI',  2024, 116, '/assets/images/vehicles/toyota-yaris.webp',         5, 'HYBRID',   'AUTOMATIC', 12000, 40.00,  1),
    -- Compactes
    (7,  'Peugeot',       '508',           'COMPACT',    2023, 130, '/assets/images/vehicles/peugeot-508.webp',          5, 'DIESEL',   'AUTOMATIC', 28000, 65.00,  1),
    (8,  'Citroën',       'C4',            'COMPACT',    2022, 130, '/assets/images/vehicles/citroen-c4.webp',           5, 'PETROL',   'AUTOMATIC', 34000, 48.00,  1),
    (9,  'Volkswagen',    'Golf VIII',     'COMPACT',    2023, 150, '/assets/images/vehicles/volkswagen-golf.webp',      5, 'PETROL',   'AUTOMATIC', 19000, 52.00,  1),
    (10, 'BMW',           'Série 3',       'COMPACT',    2023, 190, '/assets/images/vehicles/bmw-serie3.webp',           5, 'DIESEL',   'AUTOMATIC', 22000, 85.00,  1),
    (11, 'Audi',          'A5',            'COMPACT',    2024, 204, '/assets/images/vehicles/audi-a5.webp',              5, 'PETROL',   'AUTOMATIC', 15000, 95.00,  1),
    (12, 'Tesla',         'Model 3',       'COMPACT',    2023, 283, '/assets/images/vehicles/tesla-model3.webp',         5, 'ELECTRIC', 'AUTOMATIC', 16000, 75.00,  1),
    (13, 'Toyota',        'Corolla',       'COMPACT',    2024, 140, '/assets/images/vehicles/toyota-corolla.webp',       5, 'HYBRID',   'AUTOMATIC', 18500, 50.00,  1),
    -- SUV
    (14, 'Peugeot',       '3008',          'SUV',        2022, 130, '/assets/images/vehicles/peugeot-3008.webp',         5, 'DIESEL',   'AUTOMATIC', 41000, 58.00,  1),
    (15, 'Renault',       'Austral',       'SUV',        2023, 200, '/assets/images/vehicles/renault-austral.webp',      5, 'HYBRID',   'AUTOMATIC', 14000, 62.00,  1),
    (16, 'Toyota',        'RAV4 Hybride',  'SUV',        2023, 218, '/assets/images/vehicles/toyota-rav4.webp',          5, 'HYBRID',   'AUTOMATIC', 26000, 68.00,  1),
    (17, 'Mercedes-Benz', 'GLA',           'SUV',        2024, 163, '/assets/images/vehicles/mercedes-gla.webp',         5, 'PETROL',   'AUTOMATIC',  9000, 90.00,  1),
    (18, 'Renault',       'Megane E-Tech', 'SUV',        2023, 220, '/assets/images/vehicles/renault-megane-etech.webp', 5, 'ELECTRIC', 'AUTOMATIC', 11000, 60.00,  1),
    -- Utilitaires
    (19, 'Renault',       'Kangoo Van',    'COMMERCIAL', 2022,  95, '/assets/images/vehicles/renault-kangoo-van.webp',   2, 'DIESEL',   'MANUAL',    45000, 40.00,  1),
    (20, 'Peugeot',       'Partner',       'COMMERCIAL', 2023, 100, '/assets/images/vehicles/peugeot-partner.webp',      3, 'DIESEL',   'MANUAL',    27000, 42.00,  1),
    (21, 'Citroën',       'Jumpy',         'COMMERCIAL', 2023, 145, '/assets/images/vehicles/citroen-jumpy.webp',        3, 'DIESEL',   'MANUAL',    31000, 55.00,  1),
    (22, 'Renault',       'Master',        'COMMERCIAL', 2022, 150, '/assets/images/vehicles/renault-master.webp',       3, 'DIESEL',   'MANUAL',    52000, 70.00,  1),
    (23, 'Peugeot',       'Boxer',         'COMMERCIAL', 2023, 140, '/assets/images/vehicles/peugeot-boxer.webp',        3, 'DIESEL',   'MANUAL',    38000, 80.00,  1),
    (24, 'Iveco',         'Daily',         'COMMERCIAL', 2023, 160, '/assets/images/vehicles/iveco-daily.webp',          3, 'DIESEL',   'MANUAL',    29000, 105.00, 1);

-- ----------------------------------------------------------------------------
-- Utilisateurs (mots de passe hachés avec BCrypt)
--   admin123    -> $2a$10$qIUm5jRFyYQ2DuQ7VPT6x.ASc3KQ.08bfNM553UxZgaMLGK2VEA1i
--   password123 -> $2a$10$0JKaWVGbar6AyY5PdeMkK.E7J5B/EcYD47z.GlZx7TSrDDMeINRq6
-- ----------------------------------------------------------------------------
INSERT INTO users (id, username, password, role) VALUES
    (1, 'admin',     '$2a$10$qIUm5jRFyYQ2DuQ7VPT6x.ASc3KQ.08bfNM553UxZgaMLGK2VEA1i', 'ADMIN'),
    (2, 'alice_m',   '$2a$10$0JKaWVGbar6AyY5PdeMkK.E7J5B/EcYD47z.GlZx7TSrDDMeINRq6', 'USER'),
    (3, 'bob_b',     '$2a$10$0JKaWVGbar6AyY5PdeMkK.E7J5B/EcYD47z.GlZx7TSrDDMeINRq6', 'USER'),
    (4, 'charlie_d', '$2a$10$0JKaWVGbar6AyY5PdeMkK.E7J5B/EcYD47z.GlZx7TSrDDMeINRq6', 'USER'),
    (5, 'sophie_l',  '$2a$10$0JKaWVGbar6AyY5PdeMkK.E7J5B/EcYD47z.GlZx7TSrDDMeINRq6', 'USER');

-- ----------------------------------------------------------------------------
-- Réservations (user_id et vehicle_id font référence aux identifiants ci-dessus)
-- ----------------------------------------------------------------------------
INSERT INTO reservations (id, user_id, vehicle_id, start_date, end_date, total_price, status, created_at) VALUES
    (1, 2,  1, '2026-10-01 00:00:00', '2026-10-05 00:00:00', 140.00, 'CONFIRMED', '2026-09-15 10:00:00'),
    (2, 2, 11, '2026-11-10 00:00:00', '2026-11-13 00:00:00', 225.00, 'CONFIRMED', '2026-09-18 14:30:00'),
    (3, 3,  6, '2026-08-01 00:00:00', '2026-08-08 00:00:00', 455.00, 'CONFIRMED', '2026-07-20 09:15:00'),
    (4, 3, 12, '2026-09-15 00:00:00', '2026-09-18 00:00:00', 174.00, 'CANCELLED', '2026-09-01 16:45:00'),
    (5, 4, 17, '2026-10-15 00:00:00', '2026-10-17 00:00:00',  80.00, 'CONFIRMED', '2026-09-19 11:20:00'),
    (6, 5, 10, '2026-12-20 00:00:00', '2026-12-27 00:00:00', 665.00, 'CONFIRMED', '2026-09-20 18:00:00');

COMMIT;
