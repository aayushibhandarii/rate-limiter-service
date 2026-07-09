# Running with Docker

## Prerequisites

- Docker
- Docker Compose

---

## Build

```bash
docker compose build
```

---

## Start

```bash
docker compose up
```

To start multiple application instances

```bash
docker compose up --build --scale server=2
```

---

## Services

### Server

Runs the Express application.

Port

```
3000
```

### Redis

Runs Redis for storing rate limiting state.

Port

```
6379
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| REDIS_HOST | redis | Redis hostname |
| NODE_ENV | production | Node environment |

---

## Verify

Configure a client

```http
PUT /admin/clients/client1
```

Example Token Bucket

```json
{
  "mode": "tokenBucket",
  "capacity": 100,
  "refillRate": 10
}
```

Check

```http
POST /check
```

```json
{
  "clientKey": "client1"
}
```

---

## Load Testing

Run

```bash
k6 run loadTest.js
```

or against the Docker deployment

```bash
k6 run loadTest.js
```

The service should return

- 200 (allowed)
- 429 (rate limited)

---

## Stop

```bash
docker compose down
```

Remove containers and volumes

```bash
docker compose down -v
```