# Documentation technique

Projet pédagogique pour le module **Tests et Qualité** à l’Efrei.

## Installation

### Prérequis

- Node.js version 18 ou supérieure
  
  - Allez sur ce lien : https://nodejs.org/fr
  - Cliquez sur obtenir node
  - mettez vos information et téléchérger le dossier .msi
  - Ouvrez votre terminal et écrivez :

  ```
  node -v
  npm -v
  ```
- npm
- Git

**Clonner le repository** :

```sh
git clone <url_repository>
cd <url_repository>
```

**Installer les dépendances** :

```sh
npm install
```

**Lancer le serveur** :

```sh
npm start

ou

npm run dev
```

### Accéder à la documentation Swagger

Une fois l'application démarrée, accédez à :

```
http://localhost:3000/api-docs
```

---

### Architecture

```markdown
- src/
  - Routes/
    - courses.js
    - students.js
  - Controllers/
    - coursesController.js
    - studentsController.js
  - Services/
    - storage.js
  - app.js
- test/
  - integration/
    - app.test.js
  - unit/
    - storage.test.js
```

## Endpoints API

### Code de statut

| Code | Signification                           |
| ---- | --------------------------------------- |
| 200  | Succès – requête traitée correctement   |
| 201  | Ressource créée avec succès             |
| 204  | Suppression réussie, pas de contenu     |
| 400  | Données invalides ou requête mal formée |
| 404  | Ressource non trouvée                   |
| 500  | Erreur serveur interne                  |

### Base URL

```
http://localhost:3000/api
```

### Cours

### 1. Lister les cours

**GET** `/courses`

Récupère une liste paginée de cours avec possibilité de filtrage.

##### Paramètres de requête

| Paramètre | Type   | Obligatoire | Description                     |
| --------- | ------ | ----------- | ------------------------------- |
| title     | string | Non         | Filtrer par titre (partiel)     |
| teacher   | string | Non         | Filtrer par professeur          |
| page      | number | Non         | Numéro de page (défaut: 1)      |
| limit     | number | Non         | Résultats par page (défaut: 10) |

##### Réponse succès (200)

```json
{
  "courses": [
    {
      "id": 1,
      "title": "Mathématiques Avancées",
      "teacher": "Prof. Dupont"
    },
    {
      "id": 2,
      "title": "Mathématiques Appliquées",
      "teacher": "Prof. Martin"
    }
  ],
  "total": 2
}
```

---

### 2. Récupérer un cours

**GET** `/courses/{id}`

Récupère les détails d'un cours spécifique avec la liste des étudiants inscrits.

##### Paramètres de chemin

| Paramètre | Type    | Description |
| --------- | ------- | ----------- |
| id        | integer | ID du cours |

##### Réponse succès (200)

```json
{
  "course": {
    "id": 1,
    "title": "Mathématiques Avancées",
    "teacher": "Prof. Dupont"
  },
  "students": [
    {
      "id": 101,
      "name": "Jean Dupuis",
      "email": "jean.dupuis@example.com"
    },
    {
      "id": 102,
      "name": "Marie Curie",
      "email": "marie.curie@example.com"
    }
  ]
}
```

##### Réponse erreur (404)

```json
{
  "error": "Course not found"
}
```

---

### 3. Créer un cours

**POST** `/courses`

Crée un nouveau cours.

##### Corps de la requête

```json
{
  "title": "Physique Quantique",
  "teacher": "Prof. Einstein"
}
```

| Champ   | Type   | Obligatoire | Description       |
| ------- | ------ | ----------- | ----------------- |
| title   | string | Oui         | Titre du cours    |
| teacher | string | Oui         | Nom du professeur |

##### Réponse succès (201)

```json
{
  "id": 3,
  "title": "Physique Quantique",
  "teacher": "Prof. Einstein"
}
```

##### Réponse erreur (400)

```json
{
  "error": "title and teacher required"
}
```

---

### 4. Mettre à jour un cours

**PUT** `/courses/{id}`

Met à jour les informations d'un cours existant.

##### Paramètres de chemin

| Paramètre | Type    | Description |
| --------- | ------- | ----------- |
| id        | integer | ID du cours |

##### Corps de la requête

```json
{
  "title": "Mathématiques Supérieures",
  "teacher": "Prof. Nouveau"
}
```

##### Réponse succès (200)

```json
{
  "id": 1,
  "title": "Mathématiques Supérieures",
  "teacher": "Prof. Dupont"
}
```

##### Réponses d'erreur

**404 - Cours non trouvé**

```json
{
  "error": "Course not found"
}
```

**400 - Titre déjà existant**

```json
{
  "error": "Course title must be unique"
}
```

---

### 5. Supprimer un cours

**DELETE** `/courses/{id}`

Supprime un cours existant.

##### Paramètres de chemin

| Paramètre | Type    | Description |
| --------- | ------- | ----------- |
| id        | integer | ID du cours |

##### Réponse erreur (404)

```json
{
  "error": "Course not found"
}
```

---

### Etudiants

### 1. Lister les étudiants

**GET** `/students`

Récupère une liste paginée des étudiants avec possibilité de filtrage.

##### Paramètres de requête

| Paramètre | Type   | Obligatoire | Description                     |
| --------- | ------ | ----------- | ------------------------------- |
| name      | string | Non         | Filtrer par nom (partiel)       |
| email     | string | Non         | Filtrer par email               |
| page      | number | Non         | Numéro de page (défaut: 1)      |
| limit     | number | Non         | Résultats par page (défaut: 10) |

##### Réponse succès (200)

```json
{
  "students": [
    {
      "id": 1,
      "name": "alice",
      "email": "alice@gmail.com"
    },
    {
      "id": 2,
      "name": "julie",
      "email": "julie@gmail.com"
    }
  ],
  "total": 2
}
```

---

### 2. Récupérer un étudiant

**GET** `/students/{id}`

Récupère les détails d'un étudiant spécifique avec la liste des étudiants inscrits.

##### Paramètres de chemin

| Paramètre | Type    | Description      |
| --------- | ------- | ---------------- |
| id        | integer | ID de l'étudiant |

##### Réponse succès (200)

```json
{
  "student": {
    "id": 1,
    "name": "Marie",
    "email": "marie@gmail.com"
  },
  "courses": [
    {
      "id": 1,
      "title": "maths",
      "teacher": "olivier"
    },
    {
      "id": 2,
      "title": "français",
      "teacher": "isabelle"
    }
  ]
}
```

##### Réponse erreur (404)

```json
{
  "error": "Student not found"
}
```

---

### 3. Créer un étudiant

**POST** `/students`

Crée un nouvel étudiant.

##### Corps de la requête

```json
{
  "name": "yoyo",
  "email": "yoyo@gmail.com"
}
```

| Champ | Type   | Obligatoire | Description         |
| ----- | ------ | ----------- | ------------------- |
| name  | string | Oui         | Nom de l'étudiant   |
| email | string | Oui         | Email de l'étudiant |

##### Réponse succès (201)

```json
{
  "id": 3,
  "name": "yoyo",
  "email": "yoyo@gmail.com"
}
```

##### Réponse erreur (400)

```json
{
  "error": "name and email required"
}
```

---

### 4. Mettre à jour un étudiant

**PUT** `/students/{id}`

Met à jour les informations d'un étudiant existant.

##### Paramètres de chemin

| Paramètre | Type    | Description      |
| --------- | ------- | ---------------- |
| id        | integer | ID de l'étudiant |

##### Corps de la requête

```json
{
  "name": "justine",
  "email": "justine@gmail.com"
}
```

##### Réponse succès (200)

```json
{
  "id": 1,
  "title": "justine",
  "teacher": "justine@gmail.com"
}
```

##### Réponses d'erreur

**404 - Etudiants non trouvé**

```json
{
  "error": "Student not found"
}
```

**400 - Données invalides**

```json
{
  "error": "Student email must be unique"
}
```

---

### 5. Supprimer un étudiant

**DELETE** `/students/{id}`

Supprime un étudiant existant.

##### Paramètres de chemin

| Paramètre | Type    | Description      |
| --------- | ------- | ---------------- |
| id        | integer | ID de l'étudiant |

##### Réponse erreur (404)

```json
{
  "error": "Student not found"
}
```

---

### Autres

### 1. Ajouter un étudiant à un cours

**POST** `/courses/{id_course}/students/{id_student}`

##### Paramètres de chemin

| Paramètre  | Type   | Description      |
| ---------- | ------ | ---------------- |
| id_course  | string | ID du cours      |
| id_student | string | ID de l'étudiant |

##### Réponse succès (201)

```json
{
  "success": true
}
```

##### Réponses d'erreur

**400 - Paramètres invalides ou erreur lors de la création**

```json
{
  "error": "Paramètres invalides ou erreur lors de la création"
}
```

---

### 2. Supprimer un étudiant d'un cours

**DELETE** `/courses/{id_course}/students/{id_student}`

##### Paramètres de chemin

| Paramètre  | Type   | Description      |
| ---------- | ------ | ---------------- |
| id_course  | string | ID du cours      |
| id_student | string | ID de l'étudiant |

##### Réponse succès (204)

Aucun contenu retourné.

##### Réponse erreur (404)

**404 - Étudiant ou cours invalide**

```json
{
  "error": "étudiant ou cours invalide"
}
```

## Tests et CI/CD

### Exécuter les tests localement

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm test -- --coverage
```

| File      | % Stmts | % Branch | % Funcs | % Lines |
| --------- | ------- | -------- | ------- | ------- |
| All files | 93.95   | 93       | 86.36   | 97.44   |

### Linting et formatage

```bash
# Vérifier le code
npm run lint

# Formater le code
npm run format
```

### Pipeline CI/CD

Le projet utilise GitHub Actions pour l'intégration continue. À chaque push ou pull request sur `master`, le pipeline exécute :

1. Installation des dépendances
2. Vérification du linting
3. Vérification du formatage
4. Exécution des tests avec rapport de couverture

### Checklist pré-déploiement

- [x] Code propre : lint et formatage appliqués
- [x] Tests automatisés passants et couverture ≥ 80%
- [x] Tests passants (43/43)
- [x] CI/CD configurée (lint, tests, couverture)
- [x] Documentation complète et Swagger à jour
- [x] Dépôt Git structuré et commits clairs
- [x] Variables d’environnement et logs configurés
