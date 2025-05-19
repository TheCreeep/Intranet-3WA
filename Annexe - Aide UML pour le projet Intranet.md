# Annexe : Guide pour la réalisation des diagrammes UML

Ce guide vous aidera à concevoir les diagrammes UML demandés dans le cadre du projet Intranet. Les diagrammes UML sont essentiels pour planifier et documenter l'architecture de votre application avant de commencer à coder.

## 1. Diagramme de Classes

Le diagramme de classes représente la structure statique de votre application en montrant les classes, leurs attributs, méthodes et les relations entre elles.

### Éléments à inclure

1. **Classes principales**:
   - `Collaborator` (avec tous les attributs du sujet)
   - Autres entités éventuelles

2. **Interfaces**:
   - `CollaboratorRepository`
   - Autres interfaces

3. **Services**:
   - `CollaboratorService`
   - `AuthService`

4. **Relations**:
   - Associations (quelles classes utilisent d'autres classes)
   - Héritages/implémentations (quelles classes implémentent quelles interfaces)
   - Compositions/agrégations (quelles classes contiennent des instances d'autres classes)

### Exemple pour guider votre réflexion

```
+-------------------------+       +-------------------------+
|      Collaborator       |       |  CollaboratorRepository |
|-------------------------|       |-------------------------|
| - id: string            |       | + findAll(): Promise<>  |
| - firstname: string     |       | + findById(): Promise<> |
| - lastname: string      |       | + findByEmail(): ...    |
| - email: string         |       | + save(): Promise<>     |
| - ...autres attributs   |       | + update(): Promise<>   |
|-------------------------|       | + delete(): Promise<>   |
| + getFullName(): string |       | + findRandom(): ...     |
| + isAdmin(): boolean    |       +-------------------------+
+-------------------------+                ^
                                          |
                                          | implements
                                          |
                               +----------------------+
                               | MongoCollaborator    |
                               | Repository           |
                               |----------------------|
                               | ...implémentations   |
                               +----------------------+
```

### Conseils pratiques

- Identifiez d'abord toutes les entités métier (domain)
- Ajoutez ensuite les interfaces des repositories
- Complétez avec les services et leurs interactions
- N'oubliez pas les contrôleurs qui font le lien avec l'API
- Utilisez la notation UML standard pour les relations:
  - `→` pour les associations
  - `⟶` pour les implémentations
  - `◆⟶` pour les compositions
  - `◇⟶` pour les agrégations

## 2. Diagramme de Cas d'Utilisation

Le diagramme de cas d'utilisation représente les interactions entre les acteurs (utilisateurs) et le système.

### Acteurs à inclure

1. **Utilisateur standard**
2. **Administrateur** (qui est aussi un utilisateur standard avec des droits supplémentaires)

### Cas d'utilisation à inclure

Pour l'utilisateur standard:
- Se connecter
- Voir un collaborateur aléatoire
- Lister tous les collaborateurs
- Filtrer les collaborateurs
- Voir ses informations de profil
- Modifier ses informations
- Se déconnecter

Pour l'administrateur (en plus des cas d'utilisation de l'utilisateur standard):
- Ajouter un collaborateur
- Modifier un collaborateur
- Supprimer un collaborateur
- Assigner le rôle d'administrateur

### Exemple pour guider votre réflexion

```
                                     +---------------------------+
                                     |       Système Intranet    |
                                     +-----------+---------------+
                                                 |
                   +----------------------+      |
                   |                      |      |
+------------------+   Utilisateur        |      |
|                  |   Standard           |      |
|                  +-----+----------------+      |
|                        |                       |
|                        | <<extends>>           |
|                        v                       |
|                  +---------------------+       |
|                  |                     |       |
|                  |  Administrateur     |       |
|                  |                     |       |
|                  +----------+----------+       |
|                             |                  |
+-----------------------------+                  |
        ^                     ^                  |
        |                     |                  |
        |                     |                  v
+-------+---------+  +--------+--------+  +-----+-----------+
| Se connecter    |  | Ajouter un      |  | Voir un         |
|                 |  | collaborateur   |  | collaborateur   |
+-----------------+  +-----------------+  | aléatoire       |
                                          +-----------------+
```

### Conseils pratiques

- Commencez par identifier tous les acteurs du système
- Listez ensuite tous les cas d'utilisation pour chaque acteur
- Utilisez les relations d'extension (<<extends>>) pour montrer qu'un acteur hérite des cas d'utilisation d'un autre
- Regroupez les cas d'utilisation par fonctionnalité
- Restez simple et clair, évitez de surcharger le diagramme

## 3. Diagramme de Séquence

Le diagramme de séquence montre l'interaction entre les différents objets dans le temps pour un scénario spécifique.

### Scénarios à diagrammer

Vous devez réaliser au moins 2 diagrammes de séquence. Voici des suggestions:

1. **Authentification d'un utilisateur**
2. **Récupération d'un collaborateur aléatoire**
3. **Modification d'un profil utilisateur**
4. **Ajout d'un nouveau collaborateur (admin)**

### Exemple pour l'authentification

```
+------------+     +------------+     +------------+     +------------+     +------------+
| Client     |     | API        |     | Auth       |     | Collaborator|     | Database  |
| (Frontend) |     | Controller |     | Service    |     | Repository  |     |           |
+------------+     +------------+     +------------+     +------------+     +------------+
      |                  |                  |                  |                  |
      | POST /auth/login |                  |                  |                  |
      |----------------->|                  |                  |                  |
      |                  | login(email, pwd)|                  |                  |
      |                  |----------------->|                  |                  |
      |                  |                  | findByEmail      |                  |
      |                  |                  |----------------->|                  |
      |                  |                  |                  | query(email)     |
      |                  |                  |                  |----------------->|
      |                  |                  |                  |                  |
      |                  |                  |                  |<-----------------|
      |                  |                  |<-----------------|                  |
      |                  |                  | verify password  |                  |
      |                  |                  |------------------|                  |
      |                  |                  |            |     |                  |
      |                  |                  |<-----------------|                  |
      |                  |                  | generate token   |                  |
      |                  |                  |------------------|                  |
      |                  |                  |            |     |                  |
      |                  |                  |<-----------------|                  |
      |                  |<-----------------|                  |                  |
      |<-----------------|                  |                  |                  |
      |                  |                  |                  |                  |
```

### Conseils pratiques

- Identifiez les participants principaux du scénario (client, contrôleur, service, repository, etc.)
- Déterminez la séquence chronologique des messages échangés
- Incluez les données importantes transmises dans les messages
- Montrez clairement les retours de fonction et les réponses
- N'hésitez pas à ajouter des notes pour clarifier des points complexes
- Pour les cas d'échec (ex: identifiants invalides), vous pouvez ajouter des branches conditionnelles

## 4. Outils recommandés

Pour réaliser vos diagrammes UML, vous pouvez utiliser:

1. **PlantUML** - Génère des diagrammes à partir de texte
   - Site: [https://plantuml.com/](https://plantuml.com/)
   - Éditeur en ligne: [https://www.planttext.com/](https://www.planttext.com/)

2. **Draw.io** - Outil de diagramme gratuit et facile à utiliser
   - Site: [https://app.diagrams.net/](https://app.diagrams.net/)

3. **Lucidchart** - Outil de diagramme professionnel (version gratuite limitée)
   - Site: [https://www.lucidchart.com/](https://www.lucidchart.com/)

4. **Visual Paradigm** - Outil UML complet (version gratuite disponible)
   - Site: [https://www.visual-paradigm.com/](https://www.visual-paradigm.com/)

## 5. Conseils pour réussir vos diagrammes UML

1. **Restez simples** - Ne surchargez pas vos diagrammes avec trop de détails
2. **Utilisez les standards UML** - Respectez les notations officielles
3. **Itérez** - Commencez par une version simple et affinez-la progressivement
4. **Validez entre pairs** - Faites vérifier vos diagrammes par votre binôme
5. **Cohérence avec le code** - Assurez-vous que vos diagrammes reflètent fidèlement le code que vous allez implémenter

## 6. Exemples de code PlantUML

### Diagramme de classes

```
@startuml
class Collaborator {
  -id: string
  -firstname: string
  -lastname: string
  -email: string
  -password: string
  -phone: string
  -birthdate: Date
  -city: string
  -country: string
  -photo: string
  -category: string
  -isAdmin: boolean
  +getFullName(): string
  +isAdministrator(): boolean
}

interface CollaboratorRepository {
  +findAll(): Promise<Collaborator[]>
  +findById(id: string): Promise<Collaborator>
  +findByEmail(email: string): Promise<Collaborator>
  +save(collaborator: Collaborator): Promise<Collaborator>
  +update(id: string, collaborator: Collaborator): Promise<Collaborator>
  +delete(id: string): Promise<boolean>
  +findRandom(): Promise<Collaborator>
  +findByFilters(filters: object): Promise<Collaborator[]>
}

class MongoCollaboratorRepository {
  +findAll(): Promise<Collaborator[]>
  +findById(id: string): Promise<Collaborator>
  +findByEmail(email: string): Promise<Collaborator>
  +save(collaborator: Collaborator): Promise<Collaborator>
  +update(id: string, collaborator: Collaborator): Promise<Collaborator>
  +delete(id: string): Promise<boolean>
  +findRandom(): Promise<Collaborator>
  +findByFilters(filters: object): Promise<Collaborator[]>
}

class CollaboratorService {
  -collaboratorRepository: CollaboratorRepository
  +getAll(): Promise<Collaborator[]>
  +getById(id: string): Promise<Collaborator>
  +getRandomCollaborator(): Promise<Collaborator>
  +createCollaborator(data: object): Promise<Collaborator>
  +updateCollaborator(id: string, data: object): Promise<Collaborator>
  +deleteCollaborator(id: string): Promise<boolean>
  +filterCollaborators(filters: object): Promise<Collaborator[]>
}

CollaboratorService --> CollaboratorRepository
MongoCollaboratorRepository ..|> CollaboratorRepository
@enduml
```

### Diagramme de cas d'utilisation

```
@startuml
left to right direction

actor "Utilisateur Standard" as User
actor "Administrateur" as Admin

rectangle "Système Intranet" {
  usecase "Se connecter" as UC1
  usecase "Voir un collaborateur aléatoire" as UC2
  usecase "Lister tous les collaborateurs" as UC3
  usecase "Filtrer les collaborateurs" as UC4
  usecase "Modifier son profil" as UC5
  usecase "Se déconnecter" as UC6

  usecase "Ajouter un collaborateur" as UC7
  usecase "Modifier un collaborateur" as UC8
  usecase "Supprimer un collaborateur" as UC9
  usecase "Assigner le rôle d'administrateur" as UC10
}

User --> UC1
User --> UC2
User --> UC3
User --> UC4
User --> UC5
User --> UC6

Admin --|> User
Admin --> UC7
Admin --> UC8
Admin --> UC9
Admin --> UC10
@enduml
```

### Diagramme de séquence

```
@startuml
participant "Client\n(Frontend)" as Client
participant "AuthController" as Controller
participant "AuthService" as Service
participant "CollaboratorRepository" as Repo
participant "Database" as DB

Client -> Controller: POST /auth/login\n{email, password}
Controller -> Service: login(email, password)
Service -> Repo: findByEmail(email)
Repo -> DB: query()
DB --> Repo: user
Repo --> Service: user
Service -> Service: verify password
Service -> Service: generate token
Service --> Controller: {user, token}
Controller --> Client: 200 OK {user, token}
@enduml
```