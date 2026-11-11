# AutoRent — Projet Bases du Web (BAWE) — ENSIIE FISA FC 2025-2026

Site de location de véhicules. Ce fichier explique comment installer et lancer le projet. Le fonctionnement du site, les technologies et les choix techniques sont décrits dans `rapport.pdf`.

Technologies : **Java Spring Boot** (serveur), **HTML / CSS / JavaScript** (client), **SQLite** (base de données).

---

## 1. Prérequis

| Outil | Version | Usage |
| --- | --- | --- |
| JDK | 21 | Exécution du serveur |
| Python 3 + paquet `bcrypt` | — | Remplissage de la base avec `init_db.py` (option A) |
| `sqlite3` ou DB Browser for SQLite | — | Remplissage de la base avec `init_db.sql` (option B, sans Python) |
| Connexion Internet | — | Polices Google Fonts et calendrier Flatpickr chargés depuis un CDN |

Maven n'est **pas** à installer : le wrapper `mvnw` / `mvnw.cmd` fourni télécharge ce qu'il faut.

---

## 2. Installation et lancement

1. Décompresser l'archive et se placer dans le dossier racine du projet.

2. Remplir la base de données `data/autorent.db`. Deux options :

   **Option A — avec Python** (crée aussi les tables) :
   ```bash
   pip install bcrypt
   python init_db.py
   ```
   Passer ensuite directement à l'étape 3.

   **Option B — sans Python, avec `init_db.sql`** :

   Ce script ne crée pas les tables : **Spring Boot les crée au premier lancement du serveur**. Il faut donc :
   1. Lancer le serveur une première fois (étape 3), puis l'arrêter (`Ctrl+C`).
   2. Exécuter le script depuis la racine du projet :
      ```bash
      sqlite3 data/autorent.db < init_db.sql
      ```
      Sans ligne de commande : avec _DB Browser for SQLite_, ouvrir `data/autorent.db`, onglet « Exécuter le SQL », coller le contenu de `init_db.sql`, puis « Écrire les modifications ».
   3. Relancer le serveur. Ce redémarrage est nécessaire : le serveur met la liste des véhicules en cache et ne voit pas les modifications faites directement dans la base.

   ⚠️ **Attention** : dans les deux cas, le script supprime d'abord toutes les données existantes (comptes créés, réservations, véhicules ajoutés ou modifiés) avant de réinsérer les données de démonstration. Ne le relancer que pour repartir d'une base neuve.

3. Lancer le serveur :
   ```bash
   ./mvnw spring-boot:run        # Linux / macOS
   mvnw.cmd spring-boot:run      # Windows
   ```
   Avec IntelliJ IDEA : ouvrir le projet et lancer `AutorentApplication`.

4. Ouvrir <http://localhost:8080> dans le navigateur (Firefox).

---

## 3. Comptes de test

| Utilisateur | Mot de passe | Rôle |
| --- | --- | --- |
| `admin` | `admin123` | ADMIN |
| `alice_m`, `bob_b`, `charlie_d`, `sophie_l` | `password123` | USER |

On peut aussi créer un compte depuis le site (bouton « Connexion / Inscription »).

---

## 4. Administration par l'API

Le rôle `ADMIN` gère le catalogue et les réservations via l'API REST, sans interface dédiée. Exemple d'ajout d'un véhicule avec `curl` :

```bash
# 1. Récupérer un jeton JWT
curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'

# 2. Ajouter un véhicule (remplacer <TOKEN> par le jeton reçu)
curl -X POST http://localhost:8080/api/vehicles \
     -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
     -d '{"brand":"Renault","model":"Zoe","category":"SUPERMINI","year":2024,"horsePower":110,
          "imagePath":"/assets/images/vehicles/renault-clio.webp","seatsCount":5,
          "fuelType":"ELECTRIC","transmission":"AUTOMATIC","kilometrage":0,
          "dailyPrice":45,"available":true}'
```

---

## 5. Description des fichiers

Les fichiers Java sont regroupés par dossier (plusieurs classes similaires partagent une phrase).

### Racine

| Fichier | Rôle |
| --- | --- |
| `README.md` | Ce guide d'installation |
| `rapport.pdf` | Rapport : technologies, mode d'emploi du site, détails techniques |
| `init_db.py` | Crée les tables SQLite et insère les données initiales (mots de passe hachés BCrypt) |
| `init_db.sql` | Même jeu de données en SQL pur, sans Python |
| `pom.xml` | Dépendances Maven (Spring Boot, JPA, Security, validation, JWT, SQLite) et version de Java |
| `mvnw`, `mvnw.cmd`, `.mvn/` | Wrapper Maven : lance le projet sans installer Maven |

### Client — `src/main/resources/static/`

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page d'accueil : présentation et véhicules disponibles |
| `vehicles.html` | Catalogue avec filtres, tri et modale de réservation |
| `reservations.html` | Page « Mes réservations » |
| `css/style.css` | Styles, thèmes clair et sombre (variables CSS), mise en page adaptative |
| `js/index.js` | Logique de toutes les pages : navigation, authentification, thème, langue, catalogue, réservations, notifications |
| `js/api.js` | Appels `fetch()` vers l'API REST |
| `js/translations.js` | Dictionnaires de traduction FR / EN |
| `assets/` | Images des véhicules et icônes (fichiers binaires) |

### Serveur — `src/main/java/com/baky91/autorent/`

| Fichier(s) | Rôle |
| --- | --- |
| `AutorentApplication.java` | Point d'entrée ; active les tâches planifiées et le cache |
| `controller/VehicleController.java` | Routes `/api/vehicles` : lecture, ajout, modification, suppression |
| `controller/ReservationController.java` | Routes `/api/reservations` : création, consultation, annulation |
| `controller/UserController.java` | Routes `/api/users` : profil de l'utilisateur connecté, liste pour l'admin |
| `controller/AuthentificationController.java` | Routes `/api/auth` : inscription et connexion |
| `controller/PageController.java` | Sert les pages `/vehicles` et `/reservations` |
| `service/VehicleService.java` | Filtres du catalogue, calcul des disponibilités, cache des listes |
| `service/ReservationService.java` | Règles de réservation : dates, conflits, prix, annulation |
| `service/UserService.java` | Lecture des utilisateurs (un seul ou la liste complète) |
| `service/AuthentificationService.java` | Création des comptes (`signup`) et vérification des identifiants (`signin`) |
| `service/JwtService.java` | Création et validation des jetons JWT |
| `repository/VehicleRepository.java`, `ReservationRepository.java`, `UserRepository.java` | Accès à la base via Spring Data JPA (requêtes `SELECT`, `INSERT`, `UPDATE`, `DELETE`) |
| `model/Vehicle.java`, `Reservation.java`, `User.java` | Entités JPA correspondant aux tables |
| `model/exception/ObjectNotFoundException.java`, `ReservationConflictException.java` | Exceptions métier |
| `dto/VehicleDTO.java`, `ReservationDTO.java`, `UserDTO.java` | Objets échangés avec le client (entrées, sorties, paramètres de recherche) |
| `configuration/SecurityConfiguration.java`, `JwtAuthenticationFilter.java` | Règles d'accès par rôle et filtre d'authentification JWT |
| `configuration/ApplicationConfiguration.java` | Beans : chargement des utilisateurs, hachage BCrypt, gestionnaire de cache |
| `configuration/GlobalExceptionHandler.java` | Transforme les exceptions en réponses HTTP lisibles |
| `configuration/LocalDateConverter.java`, `LocalDateTimeConverter.java` | Conversion des dates pour SQLite |
| `job/UpdateReservationsStatusJob.java` | Tâches planifiées : statut `COMPLETED` (18 h) et vidage du cache (minuit) |

### Données

| Fichier | Rôle |
| --- | --- |
| `src/main/resources/application.properties` | Port 8080, chemin de la base SQLite, clé et durée de vie du JWT |
| `data/autorent.db` | Base SQLite, créée au premier lancement du serveur |
