# AI Service

Service IA de SmartApplyAI.

## Responsabilites

- gerer les modeles IA
- enregistrer les requetes de generation
- enregistrer les reponses de generation
- appeler OpenAI si la cle est configuree
- utiliser un fallback local sinon
- envoyer des notifications lors des actions IA importantes

## Entites principales

- `AIModel`
- `AIGenerationRequest`
- `AIGenerationResponse`

## Routes principales

- `GET /ai-models`
- `POST /ai-models`
- `GET /ai-models/:id`
- `POST /ai-requests`
- `GET /ai-requests`
- `GET /ai-requests/:id`
- `POST /ai-responses`
- `GET /ai-responses`
- `GET /ai-responses/:id`

## Variables importantes

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_TIMEOUT_MS`

## Points importants

- le frontend construit le contexte utilisateur puis appelle ce service
- les reponses peuvent etre structurees pour :
  - CV
  - lettre de motivation
  - email de candidature
  - adaptation de contenu
- si OpenAI est indisponible, le fallback local garde l'application fonctionnelle

## Scripts

```powershell
npm run dev
npm start
```

## URL locale

```text
http://localhost:5003
```
