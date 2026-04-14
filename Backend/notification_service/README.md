# Notification Service

Service de notifications de SmartApplyAI.

## Responsabilites

- recevoir les notifications internes depuis les autres services
- stocker les notifications utilisateur
- lister les notifications de l'utilisateur connecte
- marquer une notification comme lue
- tout marquer comme lu
- archiver une notification
- permettre la consultation admin

## Routes principales

- `POST /notifications/internal`
- `GET /notifications/me`
- `PATCH /notifications/me/read-all`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/:id/archive`
- `GET /notifications`

## Services integres

Le service est utilise par :

- `auth_service`
- `profile_service`
- `job_service`
- `ai_service`
- `document_service`

## Securite

- `POST /notifications/internal` utilise `x-internal-service-token`
- les routes utilisateur utilisent JWT Bearer
- `GET /notifications` est reserve aux admins

## Scripts

```powershell
npm run dev
npm start
```

## URL locale

```text
http://localhost:5005
```
