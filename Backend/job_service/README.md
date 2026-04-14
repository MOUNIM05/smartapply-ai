# Job Service

Service de gestion des offres d'emploi et des candidatures.

## Responsabilites

- creation d'offres
- consultation des offres
- consultation d'une offre par id
- creation de candidatures
- consultation admin des candidatures

## Routes principales

- `POST /job-offers`
- `GET /job-offers`
- `GET /job-offers/:id`
- `POST /applications`
- `GET /applications`
- `GET /applications/:id`

## Points importants

- une candidature reference un `profileId` et un `jobOfferId`
- une candidature peut stocker :
  - `cvFile`
  - `motivationLetterFile`
- les fichiers sont verifies comme PDF
- le service envoie des notifications pour la creation d'offre et l'envoi de candidature

## Scripts

```powershell
npm run dev
npm start
```

## URL locale

```text
http://localhost:5002
```
