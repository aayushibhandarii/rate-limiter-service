# Redis Rate Limiter Service

A configurable rate limiting service built with **Node.js**, **TypeScript**, **Express**, **Redis**, and **Lua**.

The service supports two popular rate limiting algorithms:

- Token Bucket
- Sliding Window

Redis Lua scripts are used to perform atomic operations, ensuring thread-safe rate limiting even under high concurrency.

---

## Features

- Token Bucket rate limiting
- Sliding Window rate limiting
- Atomic Redis Lua scripts
- Configurable client limits
- Rate limit response headers
- Redis-backed storage
- Automatic cleanup of inactive buckets using TTL
- Docker support
- k6 load testing

---

## Tech Stack

- TypeScript
- Express.js
- Redis
- Lua
- Docker
- k6

---

## Project Structure

```
src/
├── lua/
│   ├── tokenBucket.lua
│   └── slidingWindow.lua
│
├── redis/
│   └── client.ts
│
├── helper.ts
└── server.ts
```

---

## Architecture

```
                Client
                   │
                   ▼
          Express API Server
                   │
                   ▼
             Redis Database
                   │
                   ▼
            Atomic Lua Scripts
```

---

## Supported Algorithms

### Token Bucket

Each client has:

- Capacity
- Refill rate (tokens/second)

Requests consume tokens.

If no tokens remain, the request is rejected.

---

### Sliding Window

Each request timestamp is stored inside a Redis Sorted Set.

Old timestamps are removed before counting requests.

If the request count exceeds capacity, the request is rejected.

---

## API

### Configure Client

```
PUT /admin/clients/:key
```

### Token Bucket

```json
{
  "mode": "tokenBucket",
  "capacity": 100,
  "refillRate": 10
}
```

### Sliding Window

```json
{
  "mode": "slidingWindow",
  "capacity": 100,
  "windowSize": 60
}
```

---

### Check Request

```
POST /check
```

Body

```json
{
  "clientKey": "client1"
}
```

---

## Response Headers

Every response includes

```
RateLimit-Limit
RateLimit-Remaining
RateLimit-Reset
RateLimit-Mode
```

---

## Running Locally

Install dependencies

```bash
npm install
```

Start development server

```bash
npm run dev
```

Build

```bash
npm run build
```

Run production build

```bash
npm start
```

---

## Load Testing

The project includes a k6 load testing script.

Run

```bash
k6 run loadTest.js
```

Example benchmark (local machine)

- ~2,000–2,600 requests/sec
- 100% expected responses (200 or 429)

---

## Future Improvements

- Persist client configurations in Redis
- Authentication for admin APIs
- Distributed configuration management
- Prometheus metrics
- Kubernetes deployment

---
