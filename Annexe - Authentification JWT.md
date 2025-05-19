# Annexe : Implémentation de l'authentification JWT

## Introduction

L'authentification est une fonctionnalité cruciale pour sécuriser votre application Intranet. Cette annexe explique comment mettre en place une authentification basée sur les JSON Web Tokens (JWT) dans votre projet.

## 1. Concepts clés

### 1.1 Sessions vs JWT

Il existe principalement deux approches pour gérer l'authentification dans une application web :

**Sessions côté serveur :**
- L'état de la session est stocké sur le serveur
- Un identifiant de session est envoyé au client (généralement via un cookie)
- Nécessite une gestion d'état côté serveur (en mémoire ou dans une base de données)
- Bien pour les applications monolithiques

**Tokens JWT :**
- Tout l'état nécessaire est encodé dans le token lui-même
- Le token est signé cryptographiquement pour garantir son intégrité
- Sans état côté serveur ("stateless")
- Idéal pour les API REST et les architectures microservices

Pour notre API REST, nous utiliserons les tokens JWT.

### 1.2 Structure d'un JWT

Un JWT se compose de trois parties séparées par des points :
1. **Header** : Contient le type de token et l'algorithme de signature
2. **Payload** : Contient les données (claims) du token
3. **Signature** : Garantit l'intégrité du token

Exemple :
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJlbWFpbCI6ImV4YW1wbGVAdXNlci5jb20iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjI0MjYyMn0.X30eCmrOHpAyI9F9vVKKV7SZAuLAUZkZKN9U5kDQxPM
```

## 2. Installation des dépendances

Vous avez besoin des packages suivants :

```bash
npm install jsonwebtoken bcrypt
```

- `jsonwebtoken` : Pour créer et vérifier les tokens JWT
- `bcrypt` : Pour hacher les mots de passe

## 3. Implémentation dans l'architecture en couches

### 3.1 Couche Infrastructure - Services d'authentification

Créez un fichier `infrastructure/auth/authService.js` :

```javascript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export class AuthService {
  constructor(collaboratorRepository) {
    this.collaboratorRepository = collaboratorRepository;
  }

  /**
   * Génère un token JWT pour un utilisateur
   * @param {Object} user - Utilisateur authentifié
   * @returns {string} Token JWT
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  /**
   * Vérifie un token JWT
   * @param {string} token - Token JWT à vérifier
   * @returns {Object} Payload décodé
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token invalide');
    }
  }

  /**
   * Authentifie un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe en clair
   * @returns {Promise<Object>} Objet contenant l'utilisateur et le token
   */
  async login(email, password) {
    // Recherche de l'utilisateur par email
    const user = await this.collaboratorRepository.findByEmail(email);

    if (!user) {
      throw new Error('Identifiants invalides');
    }

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Identifiants invalides');
    }

    // Génération du token
    const token = this.generateToken(user);

    // Retourne l'utilisateur et le token
    return {
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        isAdmin: user.isAdmin
      },
      token
    };
  }

  /**
   * Hache un mot de passe
   * @param {string} password - Mot de passe en clair
   * @returns {Promise<string>} Mot de passe haché
   */
  async hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
```

### 3.2 Couche Présentation - Middlewares d'authentification

Créez un fichier `presentation/middlewares/authMiddleware.js` :

```javascript
import { AuthService } from '../../infrastructure/auth/authService.js';

// Instance du service d'authentification
// En production, utilisez l'injection de dépendances
let authService;

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = async (req, res, next) => {
  try {
    // Récupération du token depuis les headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    // Extraction du token
    const token = authHeader.split(' ')[1];

    // Vérification du token
    const decoded = authService.verifyToken(token);

    // Récupération de l'utilisateur complet à partir de son ID
    const user = await collaboratorRepository.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    // Ajout de l'utilisateur à la requête
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

/**
 * Vérifie si l'utilisateur est administrateur
 */
export const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Accès refusé - Droits administrateur requis' });
  }

  next();
};

/**
 * Configure le service d'authentification
 */
export const setupAuthMiddleware = (service) => {
  authService = service;
};
```

### 3.3 Couche Présentation - Contrôleur d'authentification

Créez un fichier `presentation/controllers/AuthController.js` :

```javascript
/**
 * Contrôleur d'authentification
 */
class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * Authentifie un utilisateur
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation des données
      if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis' });
      }

      // Appel au service d'authentification
      const result = await this.authService.login(email, password);

      res.status(200).json(result);
    } catch (error) {
      // Pour la sécurité, ne pas révéler la nature de l'erreur
      res.status(401).json({ message: 'Identifiants invalides' });
    }
  }

  /**
   * Récupère les informations de l'utilisateur connecté
   */
  async getCurrentUser(req, res) {
    try {
      // L'utilisateur est déjà disponible grâce au middleware
      const user = req.user;

      // Ne pas renvoyer le mot de passe
      const { password, ...userWithoutPassword } = user;

      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}

export default AuthController;
```

### 3.4 Couche Présentation - Routes d'authentification

Créez un fichier `presentation/routes/authRoutes.js` :

```javascript
import express from 'express';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

export default (authController) => {
  /**
   * @route POST /api/auth/login
   * @desc Authentifie un utilisateur
   * @access Public
   */
  router.post('/login', (req, res) => {
    authController.login(req, res);
  });

  /**
   * @route GET /api/auth/me
   * @desc Récupère les informations de l'utilisateur connecté
   * @access Privé
   */
  router.get('/me', isAuthenticated, (req, res) => {
    authController.getCurrentUser(req, res);
  });

  return router;
};
```

### 3.5 Configuration des routes d'authentification

Modifiez votre fichier `presentation/routes/index.js` :

```javascript
import collaboratorRoutesFactory from './collaboratorRoutes.js';
import authRoutesFactory from './authRoutes.js';
import AuthController from '../controllers/AuthController.js';
import { AuthService } from '../../infrastructure/auth/authService.js';
import { setupAuthMiddleware } from '../middlewares/authMiddleware.js';

export const setupRoutes = (app) => {
  // Configuration des services et contrôleurs
  // Dans un projet réel, utilisez un conteneur d'injection de dépendances

  // Services
  const collaboratorRepository = {}; // À remplacer par l'implémentation réelle
  const authService = new AuthService(collaboratorRepository);

  // Configuration du middleware d'authentification
  setupAuthMiddleware(authService);

  // Contrôleurs
  const authController = new AuthController(authService);
  const collaboratorController = {}; // À remplacer par l'implémentation réelle

  // Routes
  app.use('/api/auth', authRoutesFactory(authController));
  app.use('/api/collaborators', collaboratorRoutesFactory(collaboratorController));

  // Route de base
  app.get('/api', (req, res) => {
    res.json({ message: 'API Intranet - Bienvenue!' });
  });
};
```

## 4. Utilisation côté client (frontend)

### 4.1 Stockage des tokens

Stockez le token JWT dans le localStorage ou sessionStorage :

```javascript
// Après la connexion
localStorage.setItem('token', response.data.token);

// Pour récupérer le token
const token = localStorage.getItem('token');
```

### 4.2 Ajout du token aux requêtes

Avec Axios, configurez les headers pour toutes les requêtes :

```javascript
import axios from 'axios';

// Création d'une instance axios
const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Intercepteur pour ajouter le token à toutes les requêtes
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
```

### 4.3 Protection des routes dans React

Créez un composant ProtectedRoute :

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};
```

## 5. Bonnes pratiques de sécurité

1. **Expirations courtes** : Définissez une durée de vie raisonnable pour vos tokens (1h à 24h).
2. **HTTPS** : Utilisez toujours HTTPS en production pour éviter l'interception des tokens.
3. **Validations** : Validez toujours les données reçues côté serveur.
4. **Ne stockez pas de données sensibles** dans le payload JWT, car il peut être décodé (mais pas modifié).
5. **Gestion de la déconnexion** : Les JWT ne peuvent pas être révoqués, prévoyez une stratégie (blacklist, tokens courts, etc.).
6. **Refresh tokens** : Pour les applications nécessitant une session longue, implémentez un système de refresh tokens.

## 6. Problématiques avancées

- **Refresh tokens** : Implémentez un système de refresh tokens pour maintenir la session sans reconnecter l'utilisateur.
- **Persistance de session** : Stockez le token dans un cookie HttpOnly pour plus de sécurité.

## 7. Implémentation concrète dans le projet Intranet

### 7.1 Création de la table/collection users

L'authentification s'appuiera sur la collection de collaborateurs existante.

### 7.2 Routes requises

- `POST /api/auth/login` : Authentification avec email/mot de passe
- `GET /api/auth/me` : Récupération du profil de l'utilisateur connecté

### 7.3 Protection des routes

Toutes les routes de l'API Intranet doivent être protégées à l'exception de :
- `POST /api/auth/login`
- `GET /api` (route de base pour vérifier que l'API est disponible)

Les routes d'administration doivent être accessibles uniquement aux utilisateurs avec `isAdmin = true`.

## Conclusion

L'authentification JWT est une approche moderne et efficace pour sécuriser votre API. Avec cette implémentation, vous pouvez gérer facilement les accès à votre application Intranet tout en respectant les principes d'une architecture en couches.