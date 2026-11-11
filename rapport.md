# Rapport — AutoRent, location de véhicules

**Projet Bases du Web (BAWE) — ENSIIE FISA**
Bakary Bomou

---

## 1. Technologies utilisées

| Couche | Technologie | Justification |
| --- | --- | --- |
| Client | HTML5, CSS3, JavaScript (ES modules) | Sans framework : le sujet demande de manipuler le DOM et les requêtes `fetch()` directement |
| Serveur | Java 21, Spring Boot 4 (Web MVC, Data JPA, Security) | API REST et accès à la base ; architecture en couches (contrôleur, service, repository) |
| Base de données | SQLite | Fichier unique, sans serveur à installer |
| Authentification | JWT et BCrypt | Jeton signé pour les appels protégés ; mots de passe jamais stockés en clair |
| Bibliothèque | Flatpickr | Sélection de dates avec blocage des jours indisponibles |

**Respect des contraintes du sujet.** Le client compte 7 fichiers non binaires (3 pages, 1 CSS, 3 scripts). La base compte 3 tables reliées (`users`, `vehicles`, `reservations`). Le serveur dépasse la limite de 10 fichiers : chaque classe est dans son propre fichier, comme l'impose l'architecture en couches de Spring Boot. Le détail est dans le README.

---

## 2. Mode d'emploi du site

Trois pages : **Accueil** (`/`), **Catalogue** (`/vehicles`) et **Mes réservations** (`/reservations`). Chaque page a un menu en haut et des crédits en bas. L'en-tête contient le **sélecteur de langue FR / EN** et le **bouton thème clair / sombre**. Les deux s'appliquent sans rechargement et sont mémorisés dans le navigateur.

- **Visiteur** : il parcourt le catalogue et filtre par mot-clé, dates de disponibilité, catégorie, marque, carburant, transmission, puissance, sièges et prix. Il peut trier par prix ou par année.
- **Inscription et connexion** : via la fenêtre « Connexion / Inscription » de l'en-tête.
- **Réservation** : après connexion, le bouton **Réserver** ouvre une fenêtre. Les jours déjà pris sont désactivés et le prix total (jours × prix journalier) s'affiche en direct. La confirmation apparaît sous forme de notification.
- **Mes réservations** : elles sont regroupées en cours, à venir, terminées et annulées. Une réservation à venir peut être annulée au moins un jour avant son début, après confirmation.
- **Administrateur** (compte `admin`) : il gère le catalogue et les réservations par l'API REST, avec des exemples `curl` dans le README.

**Comptes de test** : `alice_m` / `password123`, pour voir des réservations existantes. `admin` / `admin123`, pour le rôle administrateur.

*[Insérer ici les captures d'écran : chaque page en français/anglais et en mode clair/sombre, soit 3 pages × 4 modes.]*

---

## 3. Détails techniques

### 3.1 Traduction sans rechargement

Les textes statiques portent un attribut `data-i18n="clé"`, et les attributs (`placeholder`, `title`, `aria-label`) ont leur propre variante. Le dictionnaire est dans `translations.js`. Le principal défi concernait les contenus générés par JavaScript : cartes de véhicules, réservations, messages d'erreur. Plutôt que de les reconstruire à chaque changement de langue, chaque élément généré garde sa clé. Un seul passage sur le DOM suffit alors à tout retraduire. Les calendriers Flatpickr changent eux aussi de langue.

Un problème rencontré : après une connexion, le bouton affichait le nom d'utilisateur, mais changer de langue le remplaçait par le texte « Connexion / Inscription ». La solution : l'attribut `data-i18n` est retiré quand l'utilisateur est connecté, et remis sinon.

### 3.2 Cache serveur et invalidation

La liste complète du catalogue est mise en cache en mémoire avec `@Cacheable` de Spring. Les listes filtrées par dates ne le sont pas, car leur résultat dépend de la période demandée. Le cache est vidé par `@CacheEvict` à chaque modification de véhicule ou de réservation, car ces changements modifient la disponibilité. Il est aussi vidé chaque nuit, car la disponibilité dépend de la date du jour.

Choix retenu : cache en mémoire plutôt qu'un outil comme Redis. Cela évite une dépendance supplémentaire pour un volume de données faible. Limite connue : une modification faite directement dans la base n'est visible qu'après redémarrage ou au prochain vidage.

---

## 4. Conformité au sujet

| Exigence | Réalisation |
| --- | --- |
| Menu en haut, crédits en bas de chaque page | Présents sur les 3 pages |
| Bouton de traduction anglais | Sélecteur FR / EN |
| Bouton jour / nuit dynamique | Bascule sans rechargement, mémorisée |
| Interface Responsive | Site fonctionnel en version bureau comme en version mobile |
| `SELECT` | Catalogue, disponibilités, réservations de l'utilisateur |
| `INSERT`, `UPDATE`, `DELETE` | Inscription et réservation ; annulation et modification de véhicule ; suppression |
| Page dépendant de la base | Catalogue et « Mes réservations » |
| Site fonctionnel sur Firefox | Code en HTML, CSS et JavaScript standards|
