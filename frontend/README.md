# SmartApplyAI Frontend

Frontend React/Vite de SmartApplyAI.

## Stack

- React
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- Lucide React

## Pages principales

- `Login`
- `Register`
- `Dashboard`
- `Account`
- `Profile`
- `Experiences`
- `Jobs`
- `GenerateCV`
- `Documents`
- `Notifications`
- `Subscription`

## Fonctionnalites frontend

### Authentification

- login / register
- `Remember me`
- protection des routes privees

### Compte utilisateur

- modification du prenom, nom, email, adresse et mot de passe
- ajout d'une photo de profil par upload ou URL
- affichage de la photo dans la navbar

### Profil candidat

- edition du profil principal
- gestion des experiences
- gestion des formations
- gestion des competences
- gestion des langues

### Jobs

- recherche par mot-cle et localisation
- affichage liste + detail
- score de compatibilite
- conseils de candidature
- ajout d'offre
- candidature avec CV PDF et lettre PDF

### IA et documents

- page `GenerateCV`
- generation de CV
- generation de lettre de motivation
- generation d'email de candidature
- adaptation de contenu
- export PDF via `document_service`

### Notifications

- cloche de notifications
- dropdown rapide
- page detaillee
- recherche
- filtres
- archivage

### Branding et UI

- logo SmartApplyAI integre dans sidebar, navbar et ecrans d'authentification
- composants boutons harmonises
- corrections d'alignement visuel sur les pages principales
- interface admin ajustee

## Services backend utilises

- `http://localhost:5000` auth
- `http://localhost:5001` profile
- `http://localhost:5002` jobs
- `http://localhost:5003` ai
- `http://localhost:5004` documents
- `http://localhost:5005` notifications

## Scripts

```powershell
npm run dev
npm run build
npm run preview
npm run lint
```

## Lancement local

```powershell
cd Frontend
npm install
npm run dev
```

Application :

```text
http://localhost:5173
```
