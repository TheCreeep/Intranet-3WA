# Intranet 3WA

Une application interne full-stack pour 3WA, comprenant un frontend Vue.js et un backend Fastify (Node.js) avec MongoDB.

## Table des Matières

- [Configuration IDE Recommandée](#configuration-ide-recommandée)
- [Stack Technique](#stack-technique)
- [Structure du Projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Mise en Place du Projet](#mise-en-place-du-projet)
  - [1. Cloner le Dépôt](#1-cloner-le-dépôt)
  - [2. Installer les Dépendances](#2-installer-les-dépendances)
  - [3. Variables d'Environnement](#3-variables-denvironnement)
- [Lancer l'Application](#lancer-lapplication)
  - [Frontend (Vue.js)](#frontend-vuejs)
  - [Backend (Fastify)](#backend-fastify)
- [Exécuter les Tests](#exécuter-les-tests)
  - [Tests Frontend](#tests-frontend)
  - [Tests Backend](#tests-backend)
- [Compiler pour la Production](#compiler-pour-la-production)
  - [Frontend](#frontend-1)
  - [Backend](#backend-1)
- [Support des Types pour les Imports `.vue` en TS](#support-des-types-pour-les-imports-vue-en-ts)
- [Personnaliser la Configuration](#personnaliser-la-configuration)

## Configuration IDE Recommandée

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (et désactiver Vetur).

## Stack Technique

- **Frontend** : Vue 3, Vite, TypeScript, Pinia (supposé pour la gestion d'état), Vue Router
- **Backend** : Fastify, Node.js, TypeScript, MongoDB
- **Tests** : Vitest (pour le frontend)

## Structure du Projet

```
Intranet 3WA/
├── backend/                  # Application backend (Fastify, MongoDB)
│   ├── src/
│   │   ├── application/      # Cas d'utilisation, DTOs
│   │   ├── domain/           # Entités, interfaces, services de domaine
│   │   ├── infrastructure/   # Répertoires (Repositories), modèles BDD, authentification
│   │   └── presentation/     # Contrôleurs, routes, middlewares
│   └── package.json          # Dépendances spécifiques au backend (si présentes)
├── diagrammes/               # Diagrammes d'architecture ou autres
├── public/                   # Ressources statiques pour le frontend (servies par Vite)
├── src/                      # Code source de l'application frontend Vue.js
│   ├── assets/
│   ├── components/
│   ├── router/
│   ├── services/
│   ├── store/
│   └── views/
├── .env                      # Variables d'environnement racine (si présentes, probablement pour le frontend)
├── .gitignore
├── index.html                # HTML principal pour le frontend
├── package.json              # Dépendances et scripts du projet racine
├── README.md                 # Ce fichier
└── vite.config.ts            # Configuration de Vite
```

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :
- Node.js (version LTS recommandée)
- npm (fourni avec Node.js) ou yarn
- MongoDB (si exécuté localement, sinon assurez-vous que la chaîne de connexion est configurée)

## Mise en Place du Projet

### 1. Cloner le Dépôt

```sh
git clone <url-du-depot>
cd intranet-3wa
```

### 2. Installer les Dépendances

Ce projet pourrait être un monorepo. Installez les dépendances depuis le répertoire racine. S'il y a un `package.json` dans le répertoire `backend` et qu'il est géré comme un espace de travail (workspace) npm, `npm install` depuis la racine devrait s'en occuper. Sinon, vous pourriez avoir besoin d'installer les dépendances du backend séparément.

```sh
npm install
```
Si le backend a son propre `package.json` et ne fait pas partie des espaces de travail npm :
```sh
cd backend
npm install
cd ..
```

### 3. Variables d'Environnement

Ce projet utilise des fichiers `.env` pour la configuration.

- **Frontend** :
  Créez un fichier `.env` dans le répertoire racine (copiez depuis `.env.example` s'il existe).
  Variables d'exemple :
  ```env
  VITE_API_BASE_URL=http://localhost:3001/api
  ```

- **Backend** :
  Créez un fichier `.env` dans le répertoire `backend/` (copiez depuis `backend/.env.example` s'il existe).
  Variables d'exemple :
  ```env
  PORT=3001
  MONGODB_URI=mongodb://localhost:27017/intranet3wa
  JWT_SECRET=votreCleSecrete
  ```
  Assurez-vous que votre serveur MongoDB est en cours d'exécution et accessible avec l'URI fournie.

## Lancer l'Application

### Frontend (Vue.js)

Pour compiler et recharger à chaud pour le développement :
```sh
npm run dev
```
Cela démarrera généralement le frontend sur `http://localhost:5173` (port Vite par défaut).

### Backend (Fastify)

Naviguez vers le répertoire backend et démarrez le serveur de développement. (En supposant un script `dev` dans `backend/package.json` ou un script racine pour le backend).

Si vous utilisez des espaces de travail npm (et qu'un script comme `dev:backend` existe dans le `package.json` racine) :
```sh
npm run dev:backend
```
Ou, si vous exécutez depuis le répertoire backend :
```sh
cd backend
npm run dev
```
Cela démarrera généralement le serveur backend, par exemple, sur `http://localhost:3001`. Vérifiez la configuration du backend ou la sortie de la console pour le port exact.

## Exécuter les Tests

### Tests Frontend

Exécutez les tests unitaires avec Vitest :
```sh
npm run test:unit
```

### Tests Backend

(En supposant un script `test` dans `backend/package.json` ou un script racine pour le backend).

Si vous utilisez des espaces de travail npm (et qu'un script comme `test:backend` existe dans le `package.json` racine) :
```sh
npm run test:backend
```
Ou, si vous exécutez depuis le répertoire backend :
```sh
cd backend
npm run test
```

## Compiler pour la Production

### Frontend

Vérification des types, compilation et minification pour la production :
```sh
npm run build
```
Le build de production sera dans le dossier `dist/`.

### Backend

(En supposant un script `build` dans `backend/package.json` ou un script racine pour le backend).

Si vous utilisez des espaces de travail npm (et qu'un script comme `build:backend` existe dans le `package.json` racine) :
```sh
npm run build:backend
```
Ou, si vous exécutez depuis le répertoire backend :
```sh
cd backend
npm run build
```
Cela créera généralement un dossier `dist` ou `build` dans le répertoire `backend` avec le JavaScript compilé.

## Support des Types pour les Imports `.vue` en TS

TypeScript ne peut pas gérer les informations de type pour les imports `.vue` par défaut, nous remplaçons donc le CLI `tsc` par `vue-tsc` pour la vérification des types. Dans les éditeurs, nous avons besoin de [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) pour que le service de langage TypeScript soit conscient des types `.vue`.

## Personnaliser la Configuration

Voir la [Référence de Configuration de Vite](https://vite.dev/config/). Pour la configuration du backend, référez-vous à la documentation de Fastify et à la configuration spécifique du projet dans `backend/src/`.
