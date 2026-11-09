# AutoRent — Projet Bases du Web (BAWE) — ENSIIE FISA FC 2025-2026

AutoRent est un site web de **location de véhicules**. Les visiteurs consultent et filtrent le catalogue, les utilisateurs connectés réservent un véhicule sur une période donnée, suivent leurs réservations et peuvent les annuler.

Technologie principale : **Java Spring Boot** (serveur) + **HTML / CSS / JavaScript** (client) + **SQLite** (base de données).

---

## 1. Démarrage rapide

Toutes les étapes entre le téléchargement et l'affichage de la page.

### Prérequis

| Outil | Version | Usage |
| --- | --- | --- |
| JDK | 21 | Exécution du serveur |
| Python 3 + paquet `bcrypt` **ou** SQLite (`sqlite3`) | — | Remplissage de la base : `init_db.py` (Python) **ou** `data/init_data.sql` (sans Python) |
| Connexion Internet | — | Chargement des polices Google Fonts et du calendrier Flatpickr (CDN) |

Maven n'est **pas** à installer : le wrapper `mvnw` / `mvnw.cmd` fourni télécharge ce qu'il faut.

### Étapes

1. Décompresser l'archive et se placer dans le dossier du projet :
   ```bash
   tar -xzf bomou_bakary_springboot.tar.gz
   cd bomou_bakary_springboot
   ```
2. Remplir la base de données SQLite (fichier `data/autorent.db`) avec les véhicules, des utilisateurs de test (mots de passe hachés avec BCrypt) et quelques réservations. Deux possibilités :

   **Option A — avec Python** (crée aussi les tables) :
   ```bash
   pip install bcrypt
   python init_db.py
   ```
   Ensuite, passer directement à l'étape 3.

   **Option B — sans Python, avec le script SQL `data/init_data.sql`** :

   Ce script ne crée pas les tables : c'est **Spring Boot (Hibernate) qui les crée au premier lancement du serveur**. Il doit donc être exécuté **après le premier lancement** :
   1. Lancer le serveur une première fois (étape 3), puis l'arrêter (`Ctrl+C`).
   2. Exécuter le script sur la base :
      ```bash
      sqlite3 data/autorent.db < data/init_data.sql
      ```
      (ou, sans ligne de commande, avec _DB Browser for SQLite_ : ouvrir `data/autorent.db`, onglet « Exécuter le SQL », coller le contenu du fichier, puis « Écrire les modifications ».)
   3. Relancer le serveur. Ce redémarrage est nécessaire : le serveur met la liste des véhicules en cache et ne voit pas les modifications faites directement dans la base.

   ⚠️ **Attention** : dans les deux cas, le script supprime d'abord toutes les données existantes (comptes créés, réservations, véhicules ajoutés ou modifiés) avant de réinsérer les données de démonstration. Ne le relancer que pour repartir d'une base neuve.
3. Lancer le serveur :
   ```bash
   ./mvnw spring-boot:run        # Linux / macOS
   mvnw.cmd spring-boot:run      # Windows
   ```
   (Avec IntelliJ IDEA : ouvrir le projet et lancer _AutorentApplication_.)
4. Ouvrir <http://localhost:8080> dans le navigateur (Firefox recommandé).

### Comptes de test

| Utilisateur | Mot de passe | Rôle |
| --- | --- | --- |
| `admin` | `admin123` | ADMIN |
| `alice_m`, `bob_b`, `charlie_d`, `sophie_l` | `password123` | USER |

On peut aussi créer son propre compte depuis le site (bouton « Connexion / Inscription »).

---

## 2. Manuel d'utilisation

### Pages du site

| URL | Page | Contenu |
| --- | --- | --- |
| `/` | Accueil | Présentation, explication en 3 étapes, véhicules actuellement disponibles |
| `/vehicles` | Catalogue | Tous les véhicules, filtres, tri, réservation |
| `/reservations` | Mes réservations | Réservations de l'utilisateur connecté (connexion requise) |

Chaque page comporte un **menu en haut**, un **pied de page** (crédits) et, dans l'en-tête, deux commandes :

- **Sélecteur de langue FR / EN** : traduit toute l'interface sans recharger la page (y compris les contenus générés dynamiquement et les calendriers). Le choix est mémorisé dans le navigateur (`localStorage`).
- **Bouton thème clair / sombre** : bascule instantanée, également mémorisée.

Sur mobile, ces commandes se retrouvent dans le menu déroulant.

### Visiteur

- **Catalogue** : filtres par mot-clé, disponibilité (dates), catégorie, marque, carburant, transmission, puissance, nombre de sièges et prix ; tri par prix ou année ; compteur de résultats.
- **Inscription / connexion** : modale accessible depuis l'en-tête.

### Utilisateur connecté

1. Sur une carte de véhicule, cliquer sur **Réserver**.
2. Choisir les dates de départ et de retour. Les jours déjà réservés sont grisés, le tarif total est calculé en direct (`jours × prix journalier`).
3. Confirmer : une notification indique le succès.
4. La page **Mes réservations** regroupe les réservations en cours, à venir, terminées et annulées. Une réservation **à venir** peut être annulée (au moins un jour avant son début), après confirmation.
5. Cliquer sur le nom d'utilisateur dans l'en-tête permet de se déconnecter.

### Administrateur

Le rôle `ADMIN` donne accès, via l'**API REST**, à la gestion du catalogue (ajout, modification, suppression de véhicules), des utilisateurs et de toutes les réservations. Il n'y a pas d'interface graphique dédiée ; exemple avec `curl` :

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

## 3. Correspondance avec le sujet

| Exigence du sujet | Réalisation |
| --- | --- |
| Partie client (≤ 15 fichiers non binaires) + JavaScript | 7 fichiers : 3 pages HTML, 1 CSS, 3 modules JS |
| Partie serveur (≤ 10 fichiers non binaires) | Dépassement justifié par l'architecture en couches de Spring Boot (voir §4) |
| Base de données relationnelle de 2 ou 3 tables | 3 tables : `users`, `vehicles`, `reservations` (SQLite) |
| Menu en haut et crédits en bas de chaque page | `<header>` et `<footer>` présents sur les 3 pages |
| Bouton de traduction en anglais | Sélecteur FR / EN, traductions dans `js/translations.js` |
| Bouton jour / nuit dynamique | Thème clair / sombre sans rechargement, mémorisé |
| Requête `SELECT` | Catalogue, disponibilités, « Mes réservations » |
| Requête `INSERT` / `UPDATE` / `DELETE` | `INSERT` : inscription, réservation, ajout de véhicule ; `UPDATE` : annulation de réservation, modification de véhicule ; `DELETE` : suppression de véhicule ou de réservation (admin) |
| Une page dépendant du contenu de la base | Catalogue et « Mes réservations » |
| README avec démarrage du serveur | §1 |
| Archive ≤ 3 Mo | Les images des véhicules (WebP) pèsent environ 1,9 Mo |
| Navigateur | Firefox visé par le sujet |

---

## 4. Architecture et description des fichiers

```
Navigateur (HTML / CSS / JS)  ⇄  API REST (Spring Boot)  ⇄  SQLite (data/autorent.db)
```

Le serveur suit l'architecture en couches classique de Spring (_controller → service → repository → entité_), ce qui explique le nombre de fichiers Java (un fichier par classe).

### Racine du projet

| Fichier | Rôle |
| --- | --- |
| `pom.xml` | Dépendances Maven (Spring Boot 4.1.1, JPA, Security, validation, JWT, SQLite) et version de Java (21) |
| `mvnw`, `mvnw.cmd`, `.mvn/` | Wrapper Maven : lance le projet sans installer Maven |
| `init_db.py` | Crée les tables SQLite et insère les données initiales (mots de passe hachés BCrypt) |
| `data/init_data.sql` | Même jeu de données en SQL pur, pour une exécution sans Python (à lancer après le premier démarrage du serveur, qui crée les tables) |
| `src/main/resources/application.properties` | Port 8080, chemin de la base SQLite, clé et durée de vie du JWT |
| `docs/` | Cahier des charges, schéma relationnel, diagramme de cas d'utilisation, sujet |

### Client — `src/main/resources/static/`

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page d'accueil |
| `vehicles.html` | Catalogue avec filtres, tri et modale de réservation |
| `reservations.html` | Page « Mes réservations » |
| `css/style.css` | Styles, thèmes clair/sombre (variables CSS), design adaptatif |
| `js/index.js` | Logique de toutes les pages : navigation, authentification, thème, langue, catalogue, réservations, notifications et confirmations |
| `js/api.js` | Appels `fetch()` vers l'API REST |
| `js/translations.js` | Dictionnaires de traduction FR / EN |
| `assets/` | Icônes et images des véhicules (binaires) |

### Serveur — `src/main/java/com/baky91/autorent/`

| Fichier(s) | Rôle |
| --- | --- |
| `AutorentApplication.java` | Point d'entrée ; active les tâches planifiées et le cache |
| `controller/` — `VehicleController`, `ReservationController`, `UserController`, `AuthentificationController` | Exposent l'API REST (`/api/...`) |
| `controller/PageController.java` | Sert les pages `/vehicles` et `/reservations` |
| `service/` — `VehicleService`, `ReservationService`, `UserService` | Logique métier : filtres, disponibilités, règles de réservation, cache |
| `service/AuthentificationService.java`, `service/JwtService.java` | Inscription / connexion ; création et validation des jetons JWT |
| `repository/` — `VehicleRepository`, `ReservationRepository`, `UserRepository` | Accès à la base via Spring Data JPA (requêtes `SELECT`, `INSERT`, `UPDATE`, `DELETE`) |
| `model/` — `Vehicle`, `Reservation`, `User` | Entités JPA correspondant aux tables |
| `model/exception/` — `ObjectNotFoundException`, `ReservationConflictException` | Exceptions métier |
| `dto/` — `VehicleDTO`, `ReservationDTO`, `UserDTO` | Objets échangés avec le client (entrées, sorties, paramètres de recherche) |
| `configuration/SecurityConfiguration.java`, `configuration/JwtAuthenticationFilter.java` | Règles d'accès par rôle et filtre d'authentification JWT |
| `configuration/ApplicationConfiguration.java` | Beans : chargement des utilisateurs, hachage BCrypt, gestionnaire de cache |
| `configuration/GlobalExceptionHandler.java` | Transforme les exceptions en réponses HTTP claires |
| `configuration/LocalDateConverter.java`, `configuration/LocalDateTimeConverter.java` | Conversion des dates pour SQLite |
| `job/UpdateReservationsStatusJob.java` | Tâches planifiées : réservations terminées (18 h) et vidage du cache (minuit) |
| `src/test/.../AutorentApplicationTests.java` | Test de démarrage du contexte Spring |

---

## 5. Base de données

SQLite, fichier `data/autorent.db`. Les tables sont créées automatiquement par Spring Boot (Hibernate, `ddl-auto=update`) au premier lancement du serveur, ou par `init_db.py`. Les données initiales viennent de `init_db.py` ou de `data/init_data.sql`.

![Schéma relationnel](docs/schema_relationnel.jpg)

| Table | Colonnes principales |
| --- | --- |
| `users` | `id`, `username` (unique), `password` (BCrypt), `role` (`USER` / `ADMIN`) |
| `vehicles` | `id`, `brand`, `model`, `category`, `year`, `horse_power`, `image_path`, `seats_count`, `fuel_type`, `transmission`, `kilometrage`, `daily_price`, `is_available` |
| `reservations` | `id`, `user_id`, `vehicle_id`, `start_date`, `end_date`, `total_price`, `status` (`CONFIRMED` / `CANCELLED` / `COMPLETED`), `created_at` |

### Règles de gestion

1. La date de fin doit être postérieure ou égale à la date de début, et la date de début ne peut pas être dans le passé.
2. Un véhicule est réservable sur une période s'il n'a aucune réservation qui la chevauche.
3. Le prix total est calculé à partir du nombre de jours et du prix journalier.
4. Une réservation ne peut être annulée que par son propriétaire, au moins un jour avant son début.
5. Les réservations confirmées dont la date de fin est passée sont marquées `COMPLETED` chaque jour à 18 h.

> Le dossier `data/scripts/` contient d'anciens scripts SQL d'un schéma antérieur ; ils ne sont **pas** utilisés. Les références sont `init_db.py` et `data/init_data.sql`.

---

## 6. API REST

| Méthode | Route | Accès |
| --- | --- | --- |
| `POST` | `/api/auth/register`, `/api/auth/login` | Public |
| `GET` | `/api/vehicles`, `/api/vehicles/{id}` | Public |
| `GET` | `/api/reservations/vehicle/{id}/unavailable-dates` | Public |
| `POST` | `/api/reservations/me` | Utilisateur connecté |
| `GET` | `/api/reservations/me` | Utilisateur connecté |
| `PUT` | `/api/reservations/me/{id}` (annulation) | Utilisateur connecté |
| `GET` | `/api/users/me` | Utilisateur connecté |
| `POST` `PUT` `DELETE` | `/api/vehicles`, `/api/vehicles/{id}` | Admin |
| `GET` `PUT` `DELETE` | `/api/reservations`, `/api/reservations/{id}` | Admin |
| `GET` | `/api/users`, `/api/users/{id}` | Admin |

L'authentification repose sur un jeton **JWT** envoyé dans l'en-tête `Authorization: Bearer <jeton>`.

---

## 7. Choix techniques notables

- **Traduction côté client** : les textes portent un attribut `data-i18n="clé"` (ou `data-i18n-placeholder`, `-title`, `-aria-label`). `LanguageManager` remplace leur contenu à partir de `translations.js`. Les contenus générés par JavaScript portent les mêmes attributs, donc ils suivent le changement de langue sans être reconstruits.
- **Thème clair / sombre** : toutes les couleurs sont des variables CSS redéfinies selon `data-theme` sur `<html>`.
- **Cache serveur** : la liste des véhicules (sans filtre de dates) est mise en cache en mémoire par Spring (`@Cacheable`). Le cache est vidé à chaque création, modification ou suppression d'un véhicule, à chaque changement de réservation, et chaque nuit (la disponibilité dépend de la date du jour).
- **Interface sans fenêtres natives** : les `alert()` et `confirm()` du navigateur sont remplacés par des notifications (_toasts_) et une modale de confirmation.
- **Sécurité** : mots de passe hachés avec BCrypt, accès aux routes d'administration limité au rôle `ADMIN`.
