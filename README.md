# SmartApply AI

SmartApply AI est une application web de gestion de CV et de candidatures. Le projet permet de gerer un profil candidat, les experiences, les competences, les offres d'emploi, les candidatures et la generation de documents avec une architecture basee sur plusieurs services backend.

## Architecture

Le projet est organise en deux parties principales:

- `frontend`: interface utilisateur React/Vite.
- `Backend`: services Node.js/Express separes par domaine.

Services backend:

- `auth_service`: authentification, utilisateurs et roles.
- `profile_service`: profils, experiences, formations, competences et langues.
- `job_service`: offres d'emploi et candidatures.
- `ai_service`: generation et adaptation de contenu texte a partir des prompts utilisateur.
- `document_service`: generation et export des CV, lettres de motivation, emails et PDF.

Services Docker:

- `frontend`: interface React/Vite.
- `mongodb`: base de donnees partagee.
- `mongo-express`: interface web pour consulter MongoDB.

## Prerequis

- Node.js 20+
- npm
- Docker
- Docker Compose
- Git

## Installation

Cloner le projet:

```bash
git clone https://github.com/MOUNIM05/smartapply-ai.git
cd smartapply-ai
```

Installer les dependances frontend:

```bash
cd frontend
npm install
```

Installer les dependances backend, service par service:

```bash
cd ../Backend/auth_service
npm install

cd ../profile_service
npm install

cd ../job_service
npm install

cd ../ai_service
npm install

cd ../document_service
npm install
```

## Variables d'environnement

Les fichiers `.env` ne doivent pas etre ajoutes dans Git. Ils restent uniquement en local.

Des exemples sont disponibles:

- `.env.example`
- `Backend/auth_service/.env.example`
- `Backend/profile_service/.env.example`
- `Backend/job_service/.env.example`
- `Backend/ai_service/.env.example`

Pour configurer le projet, copier chaque fichier example vers `.env`, puis remplacer les valeurs `change_me`.

Exemple pour la racine:

```powershell
Copy-Item .env.example .env
```

Exemple pour un service backend:

```powershell
Copy-Item Backend/auth_service/.env.example Backend/auth_service/.env
```

Variables IA a configurer dans `Backend/ai_service/.env`:

- `OPENAI_API_KEY`: cle OpenAI utilisee uniquement cote backend
- `OPENAI_MODEL`: modele OpenAI par defaut
- `OPENAI_TIMEOUT_MS`: timeout maximum pour l'appel OpenAI

Important:

- ne jamais mettre la vraie cle OpenAI dans `Frontend/`
- ne jamais commiter la vraie cle OpenAI dans Git
- si `OPENAI_API_KEY` manque, `ai_service` utilise automatiquement le fallback mock local

## Lancement avec Docker Compose

Depuis la racine du projet:

```bash
docker compose up -d --build
```

Arreter les conteneurs:

```bash
docker compose down
```

Voir les logs:

```bash
docker compose logs -f
```

Ports principaux:

- Frontend: `http://localhost:5173`
- Auth service: `http://localhost:5000`
- Profile service: `http://localhost:5001`
- Job service: `http://localhost:5002`
- AI service: `http://localhost:5003`
- Document service: `http://localhost:5004`
- MongoDB: `localhost:27017`
- Mongo Express: `http://localhost:8081`

## Lancement frontend en local

Depuis le dossier `frontend`:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Build frontend:

```bash
npm run build
```

Lint frontend:

```bash
npm run lint
```

## Generation de documents

La page `Generate CV` utilise maintenant un flux en deux etapes:

1. `ai_service` genere un brouillon texte a partir du contexte saisi par l'utilisateur.
2. `document_service` transforme ce contenu en document PDF telechargeable.

Comportement de `ai_service`:

- si `OPENAI_API_KEY` est configuree, le service appelle l'API OpenAI
- si la cle manque ou si l'appel echoue, le service repasse sur le mock interne pour ne pas bloquer l'application

Comportement par action:

- `Generate CV`: utilise l'IA pour preparer le contenu, puis cree un PDF via `document_service`.
- `Generate Motivation Letter`: utilise l'IA pour preparer la lettre, puis cree un PDF via `document_service`.
- `Generate Email`: utilise l'IA pour preparer le message, puis cree un PDF via `document_service`.
- `Improve Content`: reste une generation texte via `ai_service`.
- `Adapt to Job Offer`: reste une generation texte via `ai_service`.

Services appeles par le frontend:

- `ai_service`: `http://localhost:5003`
- `document_service`: `http://localhost:5004`

Le resultat texte reste visible dans l'interface, et un fichier PDF est telecharge automatiquement pour les trois actions documentaires.

## Tester l'integration OpenAI depuis le frontend

1. Ajouter une vraie cle dans `Backend/ai_service/.env`:

```env
OPENAI_API_KEY=your_real_key_here
OPENAI_MODEL=gpt-5.2
OPENAI_TIMEOUT_MS=20000
```

2. Relancer le service `ai_service` ou relancer `docker compose`.
3. Se connecter au frontend sur `http://localhost:5173`.
4. Ouvrir la page `Generate CV`.
5. Choisir une action:
   - `Generate CV`
   - `Generate Motivation Letter`
   - `Generate Email`
   - `Improve Content`
   - `Adapt to Job Offer`
6. Saisir un contexte, une offre ou des points cles.
7. Cliquer sur `Generate with AI`.
8. Verifier que le texte genere est affiche et que les actions documentaires telechargent un PDF.

## CI/CD

Le pipeline CI/CD est configure avec GitHub Actions dans:

```text
.github/workflows/ci.yml
```

Le workflow se lance automatiquement sur:

- push vers `main`
- push vers `asfoury`
- pull request vers `main`
- pull request vers `asfoury`

Le pipeline execute:

1. Frontend:
   - installation avec `npm ci`
   - lint avec `npm run lint`
   - build avec `npm run build`

2. Backend:
   - installation des dependances pour chaque service
   - execution de `npm test --if-present`

3. Docker:
   - creation de fichiers `.env` temporaires pour GitHub Actions
   - verification du build avec `docker compose build`

## Workflow Git recommande

Creer ou utiliser une branche de travail:

```bash
git switch -c nom-branche
```

Ajouter les changements:

```bash
git add .
git commit -m "Description du changement"
git push origin nom-branche
```

Creer ensuite une Pull Request vers `main`.

La branche `main` est protegee. Les changements doivent passer par une Pull Request et une approbation avant le merge.

## Notes de securite

- Ne jamais pousser les fichiers `.env`.
- Ne jamais pousser `node_modules`.
- Utiliser les fichiers `.env.example` pour documenter les variables necessaires.
- Changer les mots de passe et secrets avant tout deploiement en production.

## D. Securite

L'application protege les routes backend avec un token JWT retourne apres authentification via `POST /auth/login`.

Exemple de reponse login:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

Screenshot a prendre dans Postman (`Headers`):

```text
Key: Authorization
Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Exemple d'utilisation sur une route protegee:

```text
GET http://localhost:5002/job-offers
Authorization: Bearer <access_token>
```

Petit extrait du middleware JWT:

```js
const verifyToken = (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: "Access token is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
```

Ce middleware est applique sur les routes sensibles, par exemple:

```js
router.get("/job-offers", verifyToken, listJobOffersController);
router.get("/applications", verifyToken, requireAdmin, listApplicationsController);
```
