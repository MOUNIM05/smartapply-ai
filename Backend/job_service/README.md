# Job Service

This service contains the job-related domain models:

- `JobOffer`
- `Application`
- routes, controllers, schemas, and services for both entities

Run from the project root with:

```bash
docker compose up --build
```

Service URL:

- Job service: `http://localhost:5002`

Available routes:

- `POST /job-offers`
- `GET /job-offers`
- `GET /job-offers/:id`
- `POST /applications`
- `GET /applications`
- `GET /applications/:id`
