# Auth Service Structure

This auth service now follows a more structured `app/` layout:

- `app/main.js`: entry point
- `app/config/database.js`: MongoDB connection
- `app/controllers/auth.controller.js`: HTTP controller
- `app/controllers/user.controller.js`: user self-service controller
- `app/models/auth.model.js`: mongoose model
- `app/middlewares/auth.middleware.js`: JWT auth and role checks
- `app/schemas/auth.schema.js`: request validation
- `app/schemas/user.schema.js`: user update validation
- `app/services/auth.service.js`: JWT and password logic
- `app/services/user.service.js`: current user management
- `app/routes/auth.routes.js`: API routes
- `app/routes/user.routes.js`: user routes
- `app/scripts/seed-user.js`: seed test user
- `app/scripts/seed-admin.js`: seed admin user

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

The JWT payload contains:

```json
{
  "userId": "mongo_object_id",
  "email": "user@gmail.com",
  "role": "user"
}
```

Error codes:

- `404`: user makaynch
- `401`: password ghalat
- `422`: input ghalat
- `409`: email deja kayn

## Register API

`POST /auth/register`

```json
{
  "first_name": "Mouhcine",
  "last_name": "Asfoury",
  "email": "mouhcine@gmail.com",
  "password": "12345678"
}
```

Response:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "mongo_object_id",
    "email": "mouhcine@gmail.com"
  }
}
```

## Logout API

`POST /auth/logout`

Response:

```json
{
  "message": "Logged out successfully"
}
```

## Profile APIs

Profile features were moved to the separate service:

- `Backend/profile_service`
- default local URL: `http://localhost:5001`

## User Self-Service APIs

`GET /users/me`

Header:

```text
Authorization: Bearer your_jwt_token
```

Response:

```json
{
  "user": {
    "id": "mongo_object_id",
    "first_name": "Mouhcine",
    "last_name": "Asfoury",
    "email": "mouhcine@gmail.com",
    "role": "user"
  }
}
```

`PUT /users/me`

Header:

```text
Authorization: Bearer your_jwt_token
```

Body example:

```json
{
  "first_name": "Mouhcine Updated",
  "last_name": "Asfoury Updated",
  "email": "mouhcine.updated@gmail.com",
  "password": "newpass123"
}
```

`DELETE /users/me`

Header:

```text
Authorization: Bearer your_jwt_token
```

## Admin User Management APIs

All admin routes require:

```text
Authorization: Bearer admin_jwt_token
```

`GET /users`

Returns all users.

`GET /users/:id`

Returns one user by id.

`POST /users`

Body example:

```json
{
  "first_name": "New",
  "last_name": "User",
  "email": "new.user@gmail.com",
  "password": "12345678",
  "role": "user"
}
```

`PUT /users/:id`

Body example:

```json
{
  "first_name": "Updated",
  "last_name": "User",
  "email": "updated.user@gmail.com",
  "password": "newpass123",
  "role": "admin"
}
```

`DELETE /users/:id`

## Run with Docker

1. From the project root, run `docker compose up --build`
2. Run `docker compose exec backend npm run seed:user`
3. Optional: run `docker compose exec backend npm run seed:admin`

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

Admin test account:

```json
{
  "email": "admin@gmail.com",
  "password": "admin123"
}
```
