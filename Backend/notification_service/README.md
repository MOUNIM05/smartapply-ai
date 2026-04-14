# Notification Service

Le `notification_service` centralise les notifications utilisateur de SmartApply AI.

## Responsabilites

- enregistrer les notifications envoyees par les autres services backend
- exposer les notifications a l'utilisateur connecte
- marquer une notification comme lue
- marquer toutes les notifications comme lues
- archiver une notification
- conserver les metadonnees de contexte

## Integration plateforme

Le service est utilise par:

- `auth_service`
- `profile_service`
- `job_service`
- `ai_service`
- `document_service`

Dans le frontend, les notifications sont visibles:

- dans la cloche de la navbar
- dans la page `Notifications`
- avec recherche, filtres et archivage

## Variables d'environnement

Exemple disponible dans :

- `.env.example`

Variables principales :

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `INTERNAL_SERVICE_TOKEN`

## Routes principales

- `POST /notifications/internal`
- `GET /notifications/me`
- `PATCH /notifications/me/read-all`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/:id/archive`
- `GET /notifications`

## Securite

- `POST /notifications/internal` est reserve aux autres services backend via `x-internal-service-token`
- les routes utilisateur utilisent le JWT Bearer
- la route `GET /notifications` est reservee aux admins

## Build Docker

Depuis la racine du projet :

```bash
docker compose build notification-service
docker compose up -d notification-service
```
