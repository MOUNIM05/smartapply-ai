# Profile Service

Service de gestion du profil candidat dans SmartApplyAI.

## Responsabilites

- creation du profil utilisateur
- consultation du profil courant
- mise a jour du profil courant
- suppression du profil courant
- administration des profils
- gestion des experiences
- gestion des formations
- gestion des competences
- gestion des langues

## Routes principales

### Profil

- `POST /profiles`
- `GET /profiles/me`
- `PUT /profiles/me`
- `DELETE /profiles/me`
- `GET /profiles`
- `POST /profiles/admin`
- `GET /profiles/:id`
- `PUT /profiles/:id`
- `DELETE /profiles/:id`

### Experiences

- `GET /experiences/me`
- `POST /experiences`
- `PUT /experiences/:id`
- `DELETE /experiences/:id`

### Educations

- `GET /educations/me`
- `POST /educations`
- `PUT /educations/:id`
- `DELETE /educations/:id`

### Skills

- `GET /skills/me`
- `POST /skills`
- `PUT /skills/:id`
- `DELETE /skills/:id`

### Languages

- `GET /languages/me`
- `POST /languages`
- `PUT /languages/:id`
- `DELETE /languages/:id`

## Points importants

- le profil est lie a `User`
- les sous-ressources sont liees a `Profile`
- les actions metier importantes envoient une notification

## Scripts

```powershell
npm run dev
npm start
```

## URL locale

```text
http://localhost:5001
```
