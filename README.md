# 🌐 Intranet 3WA

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build](https://img.shields.io/badge/build-passing-success.svg)
![Tests](https://img.shields.io/badge/tests-passing-success.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Last Update](https://img.shields.io/badge/last%20update-2025-success.svg)

Une application interne full-stack permettant aux collaborateurs de 3WA de se retrouver facilement. Cette plateforme offre une interface moderne et intuitive pour consulter les profils des collaborateurs, avec une gestion sécurisée des utilisateurs.

## 🏗️ Architecture du projet

Le projet est organisé selon une architecture claire et modulaire :

- **Frontend** : Situé à la racine du projet, développé avec Vue.js
- **Backend** : Situé dans le dossier `/backend`, implémente une API RESTful

### Technologies utilisées

#### 🖥️ Frontend

- ⚡ **Vue 3** - Framework JavaScript progressif
- 🛠️ **Vite** - Outil de build ultrarapide
- 📘 **TypeScript** - Typage statique pour JavaScript
- 🏪 **Pinia** - Gestion d'état pour Vue 3
- 🧭 **Vue Router** - Routage officiel pour Vue.js

#### ⚙️ Backend

- 🚀 **Fastify** - Framework web rapide et à faible overhead
- 🟢 **Node.js** - Environnement d'exécution JavaScript côté serveur
- 📘 **TypeScript** - Typage statique pour JavaScript
- 🍃 **MongoDB** - Base de données NoSQL orientée document
- 🔐 **JWT** - Authentification sécurisée

#### 🧪 Tests

- 🔍 **Vitest** - Framework de test unitaire pour Vue

## 🚀 Installation & Lancement

### Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- Node.js (version LTS recommandée)
- npm ou yarn
- MongoDB (local ou distant)

### 1️⃣ Cloner le dépôt

```bash
git clone <url-du-depot>
cd intranet-3wa
```

### 2️⃣ Installer les dépendances

```bash
# Installation des dépendances frontend
npm install

# Installation des dépendances backend
cd backend
npm install
cd ..
```

### 3️⃣ Configuration des variables d'environnement

Créez un fichier `.env` à la racine pour le frontend :

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Créez un fichier `.env` dans le dossier `backend/` :

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/intranet3wa
JWT_EXPIRES_IN=1d
JWT_SECRET=votreCleSecrete
COOKIE_SECRET=votreCleSecreteCookie
```

### 4️⃣ Lancer l'application

#### Frontend (Vue.js)

```bash
# À la racine du projet
npm run dev
```

Le frontend sera accessible à l'adresse `http://localhost:5173`

#### Backend (Fastify)

```bash
# Dans un autre terminal
cd backend
npm run dev
```

Le backend sera accessible à l'adresse `http://localhost:3000`

## 🧪 Tests

### Tests Frontend

```bash
# À la racine du projet
npm run test:unit
```

### Tests Backend

```bash
cd backend
npm run test
```

## 📡 API et Collection Postman

Une collection Postman est disponible pour tester l'API de l'application. Elle inclut toutes les routes de l'API, y compris la nouvelle route `PUT /profile` pour la mise à jour du profil utilisateur.

### Importation de la collection Postman

1. Ouvrez Postman
2. Cliquez sur le bouton "Import" en haut à gauche
3. Sélectionnez le fichier `Intranet-3WA.postman_collection.json` situé dans le dossier `/docs/postman` du projet
4. La collection sera importée avec tous les endpoints configurés

### Endpoints principaux

- **POST /auth/login** - Authentification utilisateur
- **GET /users** - Récupération de tous les utilisateurs
- **GET /users/:id** - Récupération d'un utilisateur spécifique
- **POST /users** - Création d'un nouvel utilisateur (admin)
- **PUT /users/:id** - Mise à jour d'un utilisateur (admin)
- **DELETE /users/:id** - Suppression d'un utilisateur (admin)
- **PUT /profile** - Mise à jour du profil de l'utilisateur connecté

### Utilisation de la collection

1. Commencez par exécuter la requête "Login" pour obtenir un token d'authentification
2. Le token est automatiquement stocké dans les variables de la collection
3. Les autres requêtes utilisent ce token pour l'authentification

## 📂 Structure des dossiers

```
Intranet 3WA/
├── backend/                  # Application backend (Fastify, MongoDB)
│   ├── src/
│   │   ├── application/      # Cas d'utilisation, DTOs
│   │   ├── domain/           # Entités, interfaces, services de domaine
│   │   ├── infrastructure/   # Répertoires, modèles BDD, authentification
│   │   └── presentation/     # Contrôleurs, routes, middlewares
├── docs/                     # Documentation
│   └── postman/              # Collection Postman pour tester l'API
├── public/                   # Ressources statiques
├── src/                      # Code source frontend Vue.js
│   ├── assets/               # Images, styles, etc.
│   ├── components/           # Composants réutilisables
│   ├── router/               # Configuration des routes
│   ├── services/             # Services d'API et utilitaires
│   ├── store/                # Gestion d'état (Pinia)
│   ├── types/                # Définitions de types TypeScript
│   └── views/                # Composants de page
├── .env                      # Variables d'environnement
└── vite.config.ts            # Configuration de Vite
```

## 📝 Fonctionnalités principales

- 👋 Page d'accueil avec présentation aléatoire d'un collaborateur
- 👥 Recherche et filtrage des collaborateurs par différents critères
- 👤 Profils utilisateurs détaillés
- 🔐 Authentification sécurisée
- 👑 Panneau d'administration pour les utilisateurs autorisés

## 🌐 Déploiement

Pour compiler l'application pour la production :

### Frontend

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`

### Backend

```bash
cd backend
npm run build
```

## 🙌 Contributeurs

- Équipe 3WA

## 📜 Licence

Ce projet est sous licence MIT.

---

© 2025 Léo & Edouard. Tous droits réservés.
