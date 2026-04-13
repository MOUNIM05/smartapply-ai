# AI Service

Microservice Express pour gerer les modeles IA, les requetes de generation et les reponses de generation.

## Role du service

- recevoir un prompt depuis le frontend
- stocker la demande dans MongoDB
- appeler OpenAI si `OPENAI_API_KEY` est configuree
- revenir automatiquement au mock local si la cle manque ou si l'appel OpenAI echoue
- enregistrer la reponse finale dans MongoDB

## Variables d'environnement

Copier `Backend/ai_service/.env.example` vers `Backend/ai_service/.env`, puis renseigner les valeurs locales.

Variables importantes :

- `PORT`: port du service
- `MONGO_URI`: connexion MongoDB
- `JWT_SECRET`: secret pour verifier le token JWT
- `JWT_EXPIRES_IN`: duree de vie du token
- `OPENAI_API_KEY`: cle OpenAI. A garder uniquement dans `.env`, jamais dans le frontend ou dans Git
- `OPENAI_MODEL`: modele OpenAI utilise par defaut
- `OPENAI_TIMEOUT_MS`: timeout max pour l'appel OpenAI

## Endpoints

- `GET /ai-models`
- `POST /ai-models` admin only
- `GET /ai-models/:id`
- `POST /ai-requests`
- `GET /ai-requests`
- `GET /ai-requests/:id`
- `POST /ai-responses` admin only
- `GET /ai-responses`
- `GET /ai-responses/:id`

## Flux de generation

1. Le frontend envoie `prompt`, `requestType` et `contextData` vers `POST /ai-requests`.
2. Le service stocke la demande dans `AIGenerationRequest`.
3. Si `OPENAI_API_KEY` existe, le service appelle l'API OpenAI.
4. Si OpenAI n'est pas configure ou retourne une erreur, le service utilise le fallback mock.
5. La reponse finale est stockee dans `AIGenerationResponse`.
6. Le frontend affiche le texte et peut l'envoyer au `document_service` pour generer un PDF.

## Securite

- la cle OpenAI ne doit pas etre mise dans `Frontend/`
- la cle OpenAI ne doit jamais etre committee
- les appels OpenAI partent uniquement du backend
- `.env` est ignore par Git

## Test rapide

1. Ajouter une vraie `OPENAI_API_KEY` dans `Backend/ai_service/.env`
2. Relancer le service `ai_service`
3. Se connecter au frontend
4. Aller sur la page `Generate CV`
5. Saisir un contexte ou une offre d'emploi
6. Cliquer sur `Generate with AI`
7. Verifier que le texte genere change selon le prompt et qu'un PDF est telecharge pour CV, lettre ou email
