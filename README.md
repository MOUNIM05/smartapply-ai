# SmartApplyAI

SmartApplyAI est une plateforme web de gestion de candidatures qui combine profil candidat, offres d'emploi, generation documentaire par IA, notifications et export PDF dans une architecture microservices.

## Vue d'ensemble

Le projet est compose de :

- `Frontend` : interface React/Vite
- `Backend/auth_service` : authentification, utilisateurs, roles
- `Backend/profile_service` : profils, experiences, formations, competences, langues
- `Backend/job_service` : offres d'emploi et candidatures
- `Backend/ai_service` : modeles IA, requetes IA, reponses IA
- `Backend/document_service` : generation de CV, lettres, emails, export PDF
- `Backend/notification_service` : notifications utilisateur et notifications internes
- `mongodb` : base de donnees
- `mongo-express` : interface d'administration MongoDB

## Fonctionnalites principales

- inscription, connexion et deconnexion JWT
- gestion du compte utilisateur avec avatar et adresse
- `Remember me` sur la page login
- gestion complete du profil candidat
- gestion des experiences, formations, competences et langues
- consultation, recherche et filtrage des offres
- ajout d'offres depuis l'interface
- candidature avec CV PDF et lettre de motivation PDF
- generation IA de CV, lettre de motivation et email de candidature
- export PDF des documents generes
- centre de notifications avec lecture, archivage et detail
- page abonnement `Free`, `Student`, `Premium`
- interface admin pour gerer profils, utilisateurs, notifications et contenus

## Architecture technique

### Frontend

- React
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios

### Backend

- Node.js
- Express
- MongoDB / Mongoose
- JWT
- Docker Compose

## Ports locaux

- Frontend : `http://localhost:5173`
- Auth service : `http://localhost:5000`
- Profile service : `http://localhost:5001`
- Job service : `http://localhost:5002`
- AI service : `http://localhost:5003`
- Document service : `http://localhost:5004`
- Notification service : `http://localhost:5005`
- MongoDB : `mongodb://localhost:27017`
- Mongo Express : `http://localhost:8081`

## Installation

Cloner le projet :

```bash
git clone https://github.com/MOUNIM05/smartapply-ai.git
cd smartapply-ai
```

## Variables d'environnement

Les fichiers `.env` ne doivent jamais etre pushes.

Fichiers exemples disponibles :

- `.env.example`
- `Backend/auth_service/.env.example`
- `Backend/profile_service/.env.example`
- `Backend/job_service/.env.example`
- `Backend/ai_service/.env.example`
- `Backend/notification_service/.env.example`

Exemple de copie :

```powershell
Copy-Item .env.example .env
Copy-Item Backend/auth_service/.env.example Backend/auth_service/.env
```

Variables importantes pour l'IA :

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_TIMEOUT_MS`

Si `OPENAI_API_KEY` n'est pas configuree, `ai_service` bascule sur un fallback local.

## Lancement avec Docker

Depuis la racine :

```powershell
docker compose up -d --build
```

Verifier les conteneurs :

```powershell
docker compose ps
```

Arreter :

```powershell
docker compose down
```

## Lancement local du frontend

```powershell
cd Frontend
npm install
npm run dev
```

Build frontend :

```powershell
npm run build
```

## Test simple pour la presentation

Un script unique de smoke test backend a ete ajoute.

Lancer tous les services :

```powershell
docker compose up -d --build
```

Puis executer le test :

```powershell
cd Backend
npm test
```

Ce script teste automatiquement :

- `auth_service`
- `profile_service`
- `job_service`
- `ai_service`
- `document_service`
- `notification_service`

Le resultat attendu dans le terminal est une suite de `PASS` puis :

```text
RESULT: ALL SERVICES PASSED
```

## Flux IA et documents

Le frontend collecte le contexte utilisateur puis :

1. envoie une requete vers `ai_service`
2. `ai_service` cree `AIGenerationRequest`
3. `ai_service` retourne une sortie structuree ou un fallback local
4. le frontend envoie le resultat vers `document_service`
5. `document_service` cree `GeneratedDocument`
6. le PDF est exporte
7. `notification_service` enregistre la notification correspondante

Templates documentaires relies au flux :

- `cv-modern-sidebar`
- `motivation-formal`
- `email-prime`

## Notifications

Le `notification_service` centralise les actions importantes de la plateforme.

Exemples d'evenements couverts :

- connexion / deconnexion
- creation ou mise a jour du compte
- creation ou mise a jour du profil
- ajout d'experiences, formations, competences, langues
- creation d'offre
- candidature envoyee
- generation ou export de document

Cote frontend :

- cloche dans la navbar
- compteur non lues
- page `Notifications`
- recherche
- filtres
- archivage

## README par service

- [Frontend/README.md](Frontend/README.md)
- [Backend/auth_service/README.md](Backend/auth_service/README.md)
- [Backend/profile_service/README.md](Backend/profile_service/README.md)
- [Backend/job_service/README.md](Backend/job_service/README.md)
- [Backend/ai_service/README.md](Backend/ai_service/README.md)
- [Backend/notification_service/README.md](Backend/notification_service/README.md)

## Conseils Git

Verifier l'etat avant commit :

```powershell
git status --short
```

Push final :

```powershell
git add .
git commit -m "docs: finalize project documentation"
$branch = git branch --show-current
git push -u origin $branch
```

Ne jamais pousser les fichiers `.env`.
