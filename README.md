# Real-Time Mobility Matching System (Kigali)

A scalable backend system for real-time driver-passenger matching built with TypeScript, Node.js, Redis, PostgreSQL, Docker, and H3 spatial indexing.

This project was developed as part of a Junior Backend Engineer Take-Home Challenge focused on low-latency ride coordination, concurrency safety, and production-grade backend engineering practices.

---

## 🚀 System Goals

The system is designed to:

- Track live driver locations with low staleness  
- Accept passenger ride requests  
- Match passengers with nearby drivers efficiently  
- Prevent driver double-booking under concurrency  
- Support reservation and confirmation workflows  
- Emit immutable events for observability and replayability  
- Demonstrate scalable backend architecture and trade-off reasoning  

---

## 🧰 Tech Stack

| Technology | Purpose |
|------------|--------|
| TypeScript + Node.js | Backend runtime |
| Express.js | HTTP API |
| Redis | In-memory caching + distributed locking |
| PostgreSQL | Persistent storage |
| H3 Spatial Indexing | Geo-spatial filtering |
| Docker + Docker Compose | Infrastructure |
| Jest | Testing |

---

## 🏗 High-Level Architecture

```
Passenger Request
        │
        ▼
Matching API ─────► Redis Spatial Index
        │                    │
        │                    ▼
        │           Nearby Driver Lookup
        │
        ▼
Composite Scoring Engine
        │
        ▼
Top 3 Candidate Drivers
        │
        ▼
Assignment Service
        │
        ├── Redis Locking
        ├── Confirmation Timeout
        └── Event Publishing
                │
                ▼
         Event Stream Logs

Persistent Data
        │
        ▼
   PostgreSQL
```

---

## 🚗 Driver Location Tracking

Drivers send periodic updates:

- latitude  
- longitude  
- timestamp  
- availability status  

Stored in Redis for fast access.

### Endpoint
```
POST /drivers/location
```

### Example Request
```json
{
  "driverId": "driver1",
  "lat": -1.95,
  "lng": 30.06,
  "status": "AVAILABLE"
}
```

---

## 🧍 Ride Requests

Passengers request rides with pickup/dropoff coordinates.

### Endpoint
```
POST /rides
```

### Example Request
```json
{
  "passengerId": "passenger1",
  "pickupLat": -1.944,
  "pickupLng": 30.061,
  "dropoffLat": -1.95,
  "dropoffLng": 30.08
}
```

---

## 🧠 Matching Engine

The system:

- Filters nearby drivers using H3 indexing  
- Ranks drivers using composite scoring  
- Returns top 3 candidates  

### Endpoint
```
GET /match?pickupLat=-1.95&pickupLng=30.06
```

### Example Response
```json
[
  {
    "driverId": "driver1",
    "distance": 0,
    "score": 0,
    "reason": "closest_available_driver"
  }
]
```

---

## 📊 Composite Scoring

Drivers are ranked using:

- Pickup distance  
- Availability  
- Location freshness  
- Spatial proximity  

### Formula
```
score = distance + freshness_penalty
```

Lower score = better match.

---

## 🌍 Spatial Optimization (H3)

Uses Uber H3 indexing to reduce search space.

### Benefits:
- Faster lookup  
- Reduced computation  
- Scalable geo-partitioning  
- Efficient filtering  

---

## 🔐 Match Confirmation & Safety

To prevent double-booking:

- Redis locks used during assignment  
- One driver = one active ride  
- Confirmation timeout releases lock  
- Valid state transitions enforced  

### States:
- PENDING → CONFIRMED  
- PENDING → CANCELLED  
- PENDING → EXPIRED  

---

## 📡 Event-Driven Design

Events emitted:

- DRIVER_LOCATION_UPDATED  
- RIDE_REQUESTED  
- MATCH_PROPOSED  
- DRIVER_RESERVED  
- DRIVER_CONFIRMED  
- RIDE_CANCELLED  

### Benefits:
- Observability  
- Debugging  
- Replayability  
- Loose coupling  

---

## 🗄 Data Storage

### Redis
- Live driver locations  
- Fast geo lookup  
- Distributed locking  
- Temporary state  

### PostgreSQL
- Persistent rides  
- Assignment history  
- Durable storage  

---

## ⚠️ Failure Handling

- Duplicate requests → locked safely  
- Double booking → prevented by Redis atomic lock  
- Lost confirmation → auto-expiry  
- Service restart → data persists in PostgreSQL  

---

## 📈 Scalability

Designed for 10k+ drivers.

### Strategies:
- Redis caching  
- H3 spatial partitioning  
- Stateless services  
- Event-driven architecture  
- Isolated matching service  

---

## 📊 Observability

Monitored metrics:

- Matching latency  
- Lock contention  
- Driver freshness  
- Assignment failures  
- Throughput  

---

## 🧪 Testing

### Unit Tests
- Scoring logic
- matching.test 
- Spatial indexing  
- Assignment logic  
- Timeout handling  

### Integration Tests
- Ride flow  
- integration flow  
- load.test 

### Load Tests
- Concurrent requests simulation  

### Results:
- Avg latency: 97ms  
- Max latency: 124ms  

Satisfies:
- p95 ≤ 200ms  
- p99 ≤ 500ms  

---

## 🐳 Docker Setup

### Services:
- PostgreSQL  
- Redis  

### Start
```bash
docker compose up -d
```

### Stop
```bash
docker compose down
```

---

## ⚙️ Setup Instructions

```bash
git clone <your-repo-url>
cd mobility-matching-system
npm install
docker compose up -d
npm run dev
npm run test
```

---

## 🔐 Environment Variables

```env
PORT=3000
DB_URL=postgresql://postgres:your_password@localhost:5432/mobility
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

---

## 🔄 API Flow

- Update Driver → `POST /drivers/location`  
- Create Ride → `POST /rides`
- Get all Rides → `GET /rides`  
- Find Matches → `GET /match`  
- Reserve Driver → `POST /match/reserve`  
- Confirm Match → `POST /match/confirm`
- Cancel Match->  `POST /match/cancel`

---

## ⚖️ Trade-offs

### Redis + PostgreSQL
- Faster reads (Redis)  
- Strong durability (PostgreSQL)  

### In-memory events
- Lightweight  
- Not durable (future Kafka/RabbitMQ)  

---

##  Future Improvements

- Kafka event streaming  
- Dynamic pricing  
- WebSocket real-time updates  
- Distributed workers  
- Advanced routing optimization  

---

## 📁 Project Structure

```
src/
 ├── modules/
 │    ├── assignments/
 │    ├── drivers/
 │    ├── matching/
 │    ├── rides/
 │    ├── spatial/
 │    └── events/
 │
 ├── tests/
 │    ├── unit/
 │    └── integration/
 │
 ├── config/
 ├── app.ts
 └── server.ts
```

---

## 👨‍💻 Author

Junior Backend Engineer Take-Home Challenge Submission

Built with focus on:

- Scalability  
- Correctness  
- Low latency  
- Concurrency safety  
- Clean architecture  
