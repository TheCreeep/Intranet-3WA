# Projet Intranet - Architecture en Couches

## Présentation du projet

Vous êtes en charge de développer la plateforme Intranet de votre société.

Cette plateforme, accessible uniquement en interne, doit permettre de retrouver des informations sur l'ensemble des collaborateurs. Le projet doit être réalisé en binôme et doit suivre une **architecture en couches** (layered architecture).

## Calendrier et organisation

- **Durée du projet** : 5 jours, du 19 au 23 mai
- **Travail en binôme** obligatoire
- **Gestion de projet** : Utilisation obligatoire d'un outil de gestion de projet (Trello, Kanban, GitHub Projects)
- **Versionnement** : GitHub/Gitlab/Bitbucket obligatoire avec commits réguliers
- **Évaluation** : Organisation du code, respect de l'architecture, fonctionnalités implémentées

## Stack technique

- **Backend** :
  - Node.js / Express
  - MongoDB ou SQL (MySQL/PostgreSQL)
  - Architecture en couches complète
  - API REST
  - POO obligatoire

- **Frontend** :
  - Framework JS au choix (React, Vue, Angular, etc.)
  - HTML, CSS (framework CSS libre)

## Architecture en couches (Backend)

Votre backend doit impérativement respecter l'architecture en couches suivante :

```
/backend
  /domain             # Couche domaine - entités et logique métier
    /entities         # Définition des entités métier
    /interfaces       # Interfaces des repositories
    /services         # Services métier

  /application        # Couche application - cas d'utilisation
    /dto              # Data Transfer Objects
    /use-cases        # Cas d'utilisation spécifiques
    /services         # Services d'orchestration

  /infrastructure     # Couche infrastructure
    /repositories     # Implémentation des repositories
    /database         # Configuration de la base de données
    /auth             # Gestion de l'authentification

  /presentation       # Couche présentation
    /controllers      # Contrôleurs API
    /routes           # Définition des routes
    /middlewares      # Middlewares Express

  server.js           # Point d'entrée de l'application
```

## Architecture Frontend (suggestion)

```
/frontend
  /src
    /views            # Pages (Login, Home, etc.)
    /components       # Composants UI réutilisables
    /services         # Services API et utilitaires
    /hooks            # Hooks personnalisés (React)
    /store            # État global (optionnel)
```

## Fonctionnalités de la plateforme

### A. Utilisateur standard :

L'utilisateur doit pouvoir se connecter au système via son login et mot de passe (haché en base avec `bcrypt`) :

![](./images/connexion.png)

Une fois connecté, l'utilisateur arrive sur la page d'accueil qui lui présente un de ses collaborateurs au hasard :

![](./images/homepage.png)

Le bouton "_Dire bonjour à quelqu'un d'autre_" doit permettre d'afficher un autre collaborateur au hasard.

L'utilisateur peut via le menu se déplacer sur la page de listing des collaborateurs de la société. Les collaborateurs s'affichent sous forme de card, avec toutes leurs caractéristiques :

![](./images/liste-collaborateurs.png)

Cette page doit également permettre un affichage avec un système de filtres par **nom**, **localisation** et **catégorie** :

![](./images/liste-collaborateurs-filtres.png)

La liste doit se rafraîchir instantanément.

L'utilisateur doit également pouvoir accéder à une page de modification de ses informations personnelles (incluant le login/mot de passe) en cliquant sur son image de profil dans le header :

![](./images/modifier-profil.png)

Enfin, l'utilisateur doit pouvoir se déconnecter. Après déconnexion, aucune des pages précédentes (home, listing) ne sont accessibles.

### B. Administrateur :

L'administrateur est un utilisateur standard, disposant de privilèges supplémentaires. Il peut :

- Ajouter un nouveau collaborateur
- Modifier un collaborateur existant
- Supprimer un collaborateur existant

Dans sa barre de menu, il a accès à un lien pour **"Ajouter"** un nouveau collaborateur.

L'affichage d'une card d'un utilisateur lui propose aussi 2 boutons supplémentaires **"Éditer"** et **"Supprimer"** :

![](./images/liste-collaborateurs-admin.png)

La page d'ajout est un simple formulaire pour créer un nouveau collaborateur :

![](./images/ajout-collaborateur-admin.png)

**L'administrateur peut également lors de la modification d'un collaborateur lui assigner le rôle d'administrateur.**

## Modélisation et conception

Avant de débuter le développement :

1. **Diagramme de classes UML** : Modélisez les entités de votre application (Collaborateur, Utilisateur, etc.)
2. **Diagramme de cas d'utilisation** : Identifiez les actions possibles pour chaque type d'utilisateur
3. **Diagramme de séquence** : Pour au moins 2 fonctionnalités importantes (ex: authentification, modification d'un profil)

Ces diagrammes doivent être livrés avec votre projet final.

## Contraintes techniques spécifiques

### Backend

- **Principes SOLID** : Votre code doit respecter au maximum les principes SOLID
- **Clean Code** : Nommage explicite, fonctions courtes, commentaires pertinents
- **Tests unitaires** : Testez au minimum la couche service
- **Validation des données** : Implémentez une validation des données entrantes
- **Gestion des erreurs** : Mettez en place une gestion des erreurs cohérente


### Sécurité

- **Authentification** : Sessions ou JWT au choix
- **Autorisation** : Vérification des rôles pour les opérations sensibles
- **Protection CSRF** : Pour les sessions
- **Validation des entrées** : Protection contre les injections

## Données initiales

Une base d'utilisateurs est déjà fournie avec l'énoncé (fichier `users.json`) afin que vous puissiez commencer à travailler avec des données. N'hésitez pas à consulter et analyser ces informations avant de démarrer.

La structure d'un collaborateur est la suivante :

```
id          -   Identifiant unique du collaborateur
gender      -   Sexe ("male" ou "female")
firstname   -   Prénom
lastname    -   Nom
email       -   Email pro
password    -   Mot de passe haché avec bcrypt
phone       -   Numéro de la ligne directe
birthdate   -   Date de naissance
city        -   Ville où le collaborateur travaille
country     -   Pays où le collaborateur travaille
photo       -   Une URL valide vers une image en ligne
category    -   Service dans lequel travaille le collaborateur ("Marketing", "Client" ou "Technique")
isAdmin     -   Le collaborateur est un administrateur de la plateforme (Boolean)
```

Pour votre information, le set de données fourni propose une liste de 42 utilisateurs. Pour faire vos tests, sachez que le mot de passe haché de chaque utilisateur correspond à la partie avant le `@` de son adresse email. Par exemple, pour l'utilisateur **Owen Lopez** :
```json
{
    …
    "email": "owen.lopez@example.com",
    "password": "$2b$10$IExQBXEZVifvfEOWvWsmO.4.OocNb7zQzurQerwOQh1tZx/3okSp.",
    …
}
```

Ce hash correspond à la chaîne `owen.lopez`.

Le seul administrateur du set par défaut est `admin@admin.com` avec le mot de passe `admin`.

## Livrables attendus

- Code source complet (backend et frontend) sur GitHub
- README avec instructions d'installation et d'utilisation
- Diagrammes UML (classes, cas d'utilisation, séquence)
- Présentation du projet (vendredi)

## Barème d'évaluation

- **Architecture en couches (40%)** : Respect de l'architecture, séparation des responsabilités
- **Fonctionnalités (30%)** : Implémentation des fonctionnalités demandées
- **Qualité du code (20%)** : Lisibilité, maintenabilité, tests
- **Documentation (10%)** : README, commentaires, documentation API

## Conseils pour réussir

1. **Commencez par la conception** : Prenez le temps de bien concevoir votre architecture avant de coder
2. **Divisez le travail** : Répartissez-vous les tâches en fonction des compétences de chacun
3. **Commits réguliers** : Faites des commits fréquents et explicites
4. **Tests tôt et souvent** : Testez votre code régulièrement pour éviter les mauvaises surprises
