import sqlite3
import bcrypt

def create_tables(cursor):
    # Vehicles
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vehicles (
            id integer, 
            brand varchar(255), 
            model varchar(255), 
            category varchar(255) check ((category in ('SUPERMINI','COMPACT','SUV','COMMERCIAL'))), 
            year integer, 
            horse_power integer, 
            image_path varchar(255), 
            seats_count integer, 
            fuel_type varchar(255) check ((fuel_type in ('PETROL','DIESEL','ELECTRIC','HYBRID'))), 
            transmission varchar(255) check ((transmission in ('MANUAL','AUTOMATIC'))), 
            kilometrage integer, 
            daily_price numeric(38,2), 
            is_available boolean,
            primary key (id)
        )
    """)

    print("Table 'vehicles' créée avec succès.")


    # Users
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id bigint, 
            username varchar(255) not null unique, 
            password varchar(255) not null, 
            email varchar(255) unique, 
            role varchar(255) not null check ((role in ('USER','ADMIN'))), 
            primary key (id)
        )
    """)

    print("Table 'users' créée avec succès.")

    # Reservations
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reservations (
            id bigint, 
            user_id bigint not null, 
            vehicle_id bigint not null, 
            start_date date, 
            end_date date, 
            total_price float, 
            status varchar(255) not null check ((status in ('PENDING','CONFIRMED','CANCELLED','COMPLETED'))), 
            created_at timestamp, 
            primary key (id)
        )
    """)

    print("Table 'reservations' créée avec succès.")

def insert_data(cursor):
    vehicles_to_insert = [
        ('Peugeot', '208', 'SUPERMINI', 2023, 100, '/assets/images/vehicles/peugeot-208.webp', 5, 'PETROL', 'MANUAL', 18500, 35.00, 1),
        ('Renault', 'Clio V', 'SUPERMINI', 2022, 100, '/assets/images/vehicles/renault-clio.webp', 5, 'DIESEL', 'MANUAL', 32000, 38.00, 1),
        ('Volkswagen', 'Polo 6', 'SUPERMINI', 2023, 95, '/assets/images/vehicles/volkswagen-polo.webp', 5, 'PETROL', 'AUTOMATIC', 12000, 42.00, 1),
        ('Fiat', '500', 'SUPERMINI', 2022, 70, '/assets/images/vehicles/fiat-500.webp', 4, 'PETROL', 'MANUAL', 25000, 30.00, 1),
        ('Peugeot', 'e-208', 'SUPERMINI', 2024, 136, '/assets/images/vehicles/peugeot-208.webp', 5, 'ELECTRIC', 'AUTOMATIC', 8000, 45.00, 1),
        ('Toyota', 'Yaris', 'SUPERMINI', 2024, 116, '/assets/images/vehicles/toyota-yaris.webp', 5, 'HYBRID', 'AUTOMATIC', 12000, 40.00, 1),

        ('Peugeot', '508', 'COMPACT', 2023, 130, '/assets/images/vehicles/peugeot-508.webp', 5, 'DIESEL', 'AUTOMATIC', 28000, 65.00, 1),
        ('Citroën', 'C4', 'COMPACT', 2022, 130, '/assets/images/vehicles/citroen-c4.webp', 5, 'PETROL', 'AUTOMATIC', 34000, 48.00, 1),
        ('Volkswagen', 'Golf 8', 'COMPACT', 2023, 150, '/assets/images/vehicles/volkswagen-golf.webp', 5, 'PETROL', 'AUTOMATIC', 19000, 52.00, 1),
        ('BMW', 'Série 3', 'COMPACT', 2023, 190, '/assets/images/vehicles/bmw-serie3.webp', 5, 'DIESEL', 'AUTOMATIC', 22000, 85.00, 1),
        ('Audi', 'A5', 'COMPACT', 2024, 204, '/assets/images/vehicles/audi-a5.webp', 5, 'PETROL', 'AUTOMATIC', 15000, 95.00, 1),
        ('Tesla', 'Model 3', 'COMPACT', 2023, 283, '/assets/images/vehicles/tesla-model3.webp', 5, 'ELECTRIC', 'AUTOMATIC', 16000, 75.00, 1),
        ('Toyota', 'Corolla', 'COMPACT', 2024, 140, '/assets/images/vehicles/toyota-corolla.webp', 5, 'HYBRID', 'AUTOMATIC', 18500, 50.00, 1),

        ('Peugeot', '3008', 'SUV', 2022, 130, '/assets/images/vehicles/peugeot-3008.webp', 5, 'DIESEL', 'AUTOMATIC', 41000, 58.00, 1),
        ('Renault', 'Austral', 'SUV', 2023, 200, '/assets/images/vehicles/renault-austral.webp', 5, 'HYBRID', 'AUTOMATIC', 14000, 62.00, 1),
        ('Toyota', 'RAV4 Hybride', 'SUV', 2023, 218, '/assets/images/vehicles/toyota-rav4.webp', 5, 'HYBRID', 'AUTOMATIC', 26000, 68.00, 1),
        ('Mercedes-Benz', 'GLA', 'SUV', 2024, 163, '/assets/images/vehicles/mercedes-gla.webp', 5, 'PETROL', 'AUTOMATIC', 9000, 90.00, 1),
        ('Renault', 'Megane E-Tech', 'SUV', 2023, 220, '/assets/images/vehicles/renault-megane-etech.webp', 5, 'ELECTRIC', 'AUTOMATIC', 11000, 60.00, 1),

        ('Renault', 'Kangoo Van', 'COMMERCIAL', 2022, 95, '/assets/images/vehicles/renault-kangoo-van.webp', 2, 'DIESEL', 'MANUAL', 45000, 40.00, 1),
        ('Peugeot', 'Partner', 'COMMERCIAL', 2023, 100, '/assets/images/vehicles/peugeot-partner.webp', 3, 'DIESEL', 'MANUAL', 27000, 42.00, 1),
        ('Citroën', 'Jumpy', 'COMMERCIAL', 2023, 145, '/assets/images/vehicles/citroen-jumpy.webp', 3, 'DIESEL', 'MANUAL', 31000, 55.00, 1),
        ('Renault', 'Master', 'COMMERCIAL', 2022, 150, '/assets/images/vehicles/renault-master.webp', 3, 'DIESEL', 'MANUAL', 52000, 70.00, 1),
        ('Peugeot', 'Boxer', 'COMMERCIAL', 2023, 140, '/assets/images/vehicles/peugeot-boxer.webp', 3, 'DIESEL', 'MANUAL', 38000, 80.00, 1),
        ('Iveco', 'Daily', 'COMMERCIAL', 2023, 160, '/assets/images/vehicles/iveco-daily.webp', 3, 'DIESEL', 'MANUAL', 29000, 105.00, 1)
    ]

    users_to_insert = [
        ('admin', 'admin123', 'admin@autorent.fr', 'ADMIN'),
        ('alice_m', 'password123', 'alice.martin@email.fr', 'USER'),
        ('bob_b', 'password123', 'bob.bernard@email.fr', 'USER'),
        ('charlie_d', 'password123', 'charlie.dubois@email.fr', 'USER'),
        ('sophie_l', 'password123', 'sophie.laurent@email.fr', 'USER')
    ]

    reservations_to_insert = [
        (2, 1, '2026-10-01', '2026-10-05', 140.00, 'CONFIRMED', '2026-09-15 10:00:00'),
        (2, 11, '2026-11-10', '2026-11-13', 225.00, 'PENDING', '2026-09-18 14:30:00'),
        (3, 6, '2026-08-01', '2026-08-08', 455.00, 'COMPLETED', '2026-07-20 09:15:00'),
        (3, 12, '2026-09-15', '2026-09-18', 174.00, 'CANCELLED', '2026-09-01 16:45:00'),
        (4, 17, '2026-10-15', '2026-10-17', 80.00, 'CONFIRMED', '2026-09-19 11:20:00'),
        (5, 10, '2026-12-20', '2026-12-27', 665.00, 'CONFIRMED', '2026-09-20 18:00:00')
    ]

    insert_vehicles(cursor, vehicles_to_insert)
    insert_users(cursor, users_to_insert)
    insert_reservations(cursor, reservations_to_insert)

def insert_vehicles(cursor, data):
    cursor.executemany(
        "INSERT INTO vehicles (brand, model, category, year, horse_power, image_path, seats_count, fuel_type, transmission, kilometrage, daily_price, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
        data
    )
    print("Table 'vehicles' remplies avec succès.")

def insert_users(cursor, data):
    hashed_data = []
    for user in data:
        username, password, email, role = user
        # Hachage du mot de passe avec bcrypt (décodé en string pour SQLite)
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        hashed_data.append((username, hashed_password, email, role))

    cursor.executemany(
        "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)", 
        hashed_data
    )
    print("Table 'users' remplies avec succès.")

def insert_reservations(cursor, data):
    cursor.executemany(
        "INSERT INTO reservations (user_id, vehicle_id, start_date, end_date, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        data
    )
    print("Table 'reservations' remplies avec succès.")

def clean_data(cursor):
    # Suppression des données de base pour ne pas avoir de doublons

    # Reservations
    cursor.execute("DELETE FROM reservations")
    print("Table 'reservations' vidée avec succès.")

    # Users
    cursor.execute("DELETE FROM users")
    print("Table 'users' vidée avec succès.")

    # Vehicles
    cursor.execute("DELETE FROM vehicles")
    print("Table 'vehicles' vidée avec succès.")

if __name__ == "__main__":
    db_name = "data/autorent.db"
    connection = sqlite3.connect(db_name)
    try:
        # Création d'un curseur pour exécuter les commandes SQL
        cursor = connection.cursor()

        # Création des tables si elles n'existent pas
        create_tables(cursor)

        # Nettoyage des tables
        clean_data(cursor)

        # Insertion des données
        insert_data(cursor)

        # Validation des changements (indispensable pour les INSERT / UPDATE / DELETE)
        connection.commit()
        print(f"Données insérées avec succès dans '{db_name}'.")

    except sqlite3.Error as erreur:
        print(f"Une erreur est survenue : {erreur}")
        # En cas d'erreur, on annule les modifications non validées
        connection.rollback()

    finally:
        # 8. Fermeture de la connection dans tous les cas
        connection.close()
        print("\nconnection SQLite fermée.")

