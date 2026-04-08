# Auth Service Structure

This auth service now follows a more structured `app/` layout:

- `app/main.js`: entry point
- `app/config/database.js`: MongoDB connection
- `app/controllers/auth.controller.js`: HTTP controller
- `app/models/auth.model.js`: mongoose model
- `app/schemas/auth.schema.js`: request validation
- `app/services/auth.service.js`: JWT and password logic
- `app/routes/auth.routes.js`: API routes
- `app/scripts/seed-user.js`: seed test user

## Login API

`POST /auth/login`

```json
{
  "email": "test@gmail.com",
  "password": "123456"
}
```

Response:

```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

Error codes:

- `404`: user makaynch
- `401`: password ghalat
- `422`: input ghalat

## Run with Docker

1. From the project root, run `docker compose up --build`
2. Run `docker compose exec backend npm run seed:user`

Docker Compose is located at the project root and mounts `Backend/auth_service`.

Services:

- Backend: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`
- Mongo Express: `http://localhost:8081`

## Test Account

After seeding:

```json
{
  "email": "test@gmail.com",
  "password": "123456"
}
```
