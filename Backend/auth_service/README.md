# Auth Service

Service d'authentification et de gestion utilisateur de SmartApplyAI.

## Responsabilites

- inscription
- connexion
- deconnexion
- recuperation du compte courant
- modification du compte courant
- suppression du compte courant
- administration des utilisateurs

## Routes principales

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /users/me`
- `PUT /users/me`
- `DELETE /users/me`
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

## Points importants

- JWT utilise pour les routes protegees
- role `user` et role `admin`
- prise en charge de `address` et `avatar_url`
- notifications envoyees au `notification_service` pour les actions de compte

## Scripts

```powershell
npm run dev
npm start
npm run seed:user
npm run seed:admin
```

## URL locale

```text
http://localhost:5000
```
