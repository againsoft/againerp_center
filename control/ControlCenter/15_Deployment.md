# AgainERP Control Center — Deployment Architecture

> **Status:** Architecture Documentation  
> **Version:** 1.0  
> **Step:** 15 of 17  
> **Document Type:** Enterprise Architecture — Deployment  
> **Parent Index:** [MASTER_INDEX.md](./MASTER_INDEX.md)  
> **Previous:** [14 — AI Management Center](./14_AI_Control.md)

---

## Purpose

Document deployment topologies for the Control Center — Docker, Docker Compose, Kubernetes, cloud providers, on-premise, and hybrid configurations.

## Scope

Infrastructure and deployment architecture. CI/CD pipeline implementation is out of scope.

---

## Architecture

### Deployment Zones

```mermaid
flowchart TB
    subgraph ZoneA["Zone A — AgainSoft Control Plane"]
        CC[Control Center Stack]
    end

    subgraph ZoneB["Zone B — Client Installations"]
        C1[Client 1 — On-Prem]
        C2[Client 2 — DigitalOcean]
        C3[Client 3 — AWS]
        C4[Client N — Azure]
    end

    CC <-->|Agent mTLS| C1 & C2 & C3 & C4
```

---

## Docker

All Control Center services run as Docker containers.

### Base image standards

| Property | Value |
|----------|-------|
| Base | Distroless or Alpine (minimal) |
| User | Non-root UID 1000 |
| Health check | HTTP `/health` per service |
| Labels | `againerp.service`, `againerp.version` |

### Core containers

| Container | Image | Port |
|-----------|-------|------|
| `control-web` | Next.js UI | 3000 |
| `control-api` | FastAPI gateway + services | 8000 |
| `control-worker` | Background jobs (events, alerts) | — |
| `control-postgres` | PostgreSQL 16 | 5432 |
| `control-redis` | Redis 7 | 6379 |
| `control-timescale` | TimescaleDB (metrics) | 5433 |

---

## Docker Compose

### Development / Seed tier (≤10 clients)

```yaml
# control/docker-compose.yml (conceptual — not implementation)
services:
  control-web:
    image: againerp/control-web:latest
    ports: ["3000:3000"]
    depends_on: [control-api]

  control-api:
    image: againerp/control-api:latest
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgres://control:control@control-postgres:5432/control
      REDIS_URL: redis://control-redis:6379
    depends_on: [control-postgres, control-redis]

  control-worker:
    image: againerp/control-worker:latest
    depends_on: [control-api]

  control-postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]

  control-redis:
    image: redis:7-alpine

  control-timescale:
    image: timescale/timescaledb:latest-pg16
    volumes: [tsdata:/var/lib/postgresql/data]

volumes:
  pgdata:
  tsdata:
```

### Production Compose overlay

- TLS termination via Traefik or Nginx reverse proxy
- Secrets from Docker secrets or external vault
- Log driver: json-file with rotation
- Restart policy: `unless-stopped`

---

## Kubernetes Ready

### Target architecture (100+ clients)

```mermaid
flowchart TB
    subgraph K8s["Kubernetes Cluster"]
        ING[Ingress Controller]
        GW[API Gateway Deployment]
        SVC[Domain Services Deployments]
        WRK[Worker Deployment]
        HPA[Horizontal Pod Autoscaler]

        ING --> GW
        GW --> SVC
        SVC --> HPA
        WRK --> SVC
    end

    subgraph Data["Managed Data"]
        RDS[(Cloud PostgreSQL)]
        ELASTICACHE[(Redis)]
        S3[S3 Object Storage]
    end

    SVC --> RDS & ELASTICACHE & S3
```

### K8s resources (conceptual)

| Resource | Purpose |
|----------|---------|
| Deployment | control-api, control-web, control-worker |
| Service | ClusterIP internal routing |
| Ingress | TLS termination, path routing |
| HPA | CPU/memory based scaling |
| ConfigMap | Non-secret configuration |
| Secret | External secrets operator sync |
| CronJob | License expiry batch, retention cleanup |
| PDB | Pod disruption budget (min 2 replicas) |

### Helm chart structure (Phase 2 implementation)

```
control/deploy/helm/control-center/
├── Chart.yaml
├── values.yaml
├── values-production.yaml
└── templates/
    ├── deployment-api.yaml
    ├── deployment-web.yaml
    ├── ingress.yaml
    └── ...
```

---

## Railway

Suitable for **seed tier** and staging environments.

| Component | Railway service |
|-----------|-----------------|
| control-web | Web service |
| control-api | Web service |
| control-worker | Worker service |
| PostgreSQL | Railway PostgreSQL plugin |
| Redis | Railway Redis plugin |

**Considerations:**
- Single-region only
- Automatic HTTPS
- Environment variables via Railway dashboard
- Not recommended for 100+ client production

---

## DigitalOcean

Recommended for **growth tier** (10–100 clients).

| Component | DO product |
|-----------|------------|
| Compute | App Platform or Droplets |
| Database | Managed PostgreSQL |
| Cache | Managed Redis |
| Storage | Spaces (S3-compatible) |
| Load balancer | DO Load Balancer |
| CDN | Spaces CDN for update artifacts |

```mermaid
flowchart LR
    LB[DO Load Balancer] --> APP[App Platform — API + Web]
    APP --> DB[(Managed PostgreSQL)]
    APP --> REDIS[(Managed Redis)]
    APP --> SPACES[Spaces — artifacts]
```

---

## AWS

Recommended for **scale tier** (100–10,000+ clients).

| Component | AWS service |
|-----------|-------------|
| Compute | EKS or ECS Fargate |
| Database | RDS PostgreSQL Multi-AZ |
| Cache | ElastiCache Redis |
| Storage | S3 + CloudFront CDN |
| Secrets | AWS Secrets Manager |
| KMS | License signing keys |
| WAF | AWS WAF on ALB |
| Monitoring | CloudWatch + X-Ray |

### Multi-AZ layout

```mermaid
flowchart TB
    CF[CloudFront CDN] --> WAF[AWS WAF]
    WAF --> ALB[Application Load Balancer]
    ALB --> EKS[EKS — control-center namespace]
    EKS --> RDS[(RDS Multi-AZ)]
    EKS --> ELASTICACHE[(ElastiCache)]
    EKS --> S3[(S3 artifacts)]
    KMS[AWS KMS] --> EKS
```

---

## Azure

Enterprise clients and AgainSoft Azure preference.

| Component | Azure service |
|-----------|---------------|
| Compute | AKS |
| Database | Azure Database for PostgreSQL |
| Cache | Azure Cache for Redis |
| Storage | Blob Storage + Azure CDN |
| Secrets | Azure Key Vault |
| WAF | Azure Front Door + WAF |

Equivalent topology to AWS with Azure-native services.

---

## On-Premise

AgainSoft may self-host Control Center on-prem for regulatory or cost reasons.

| Requirement | Specification |
|-------------|---------------|
| Compute | 4 vCPU / 16 GB RAM minimum (seed) |
| Storage | 500 GB SSD |
| Network | Static IP, outbound internet for LLM APIs |
| TLS | Internal CA or public CA |
| HA | Active-passive PostgreSQL (Phase 2) |

```mermaid
flowchart TB
    PROXY[Nginx / HAProxy] --> API[control-api × 2]
    PROXY --> WEB[control-web × 2]
    API --> PG[(PostgreSQL primary)]
    PG --> PGR[(PostgreSQL replica)]
    API --> REDIS[(Redis Sentinel)]
```

**Use case:** AgainSoft internal deployment; not for client self-hosting of Control Center.

---

## Hybrid Cloud

Recommended production topology for enterprise scale:

| Layer | Location | Rationale |
|-------|----------|-----------|
| Control Center API + UI | AWS/Azure primary region | Scale, managed DB |
| Update artifact CDN | CloudFront / Azure CDN | Global edge delivery |
| KMS / HSM | Cloud provider | License signing |
| LLM providers | External API | AI Service |
| DR standby | Secondary region | RPO 15 min |
| Client installations | Client-owned | Data sovereignty |

```mermaid
flowchart TB
    subgraph Primary["Primary Region — ap-southeast-1"]
        CC1[Control Center Active]
        RDS1[(RDS Primary)]
    end

    subgraph DR["DR Region — ap-south-1"]
        CC2[Control Center Standby]
        RDS2[(RDS Replica)]
    end

    subgraph Edge["Global Edge"]
        CDN[CDN — update artifacts]
    end

    RDS1 -->|async replication| RDS2
    CC1 --> CDN
    Clients[Client Agents worldwide] --> CDN
    Clients --> CC1
    Clients -.->|failover| CC2
```

---

## Client Deployment (Reference)

While not part of Control Center deployment, clients deploy AgainERP via:

| Target | Method |
|--------|--------|
| VPS | Docker Compose + Edge Agent |
| On-prem | Docker Compose / K8s + Edge Agent |
| AWS/Azure (client) | Client-managed EC2/VM + agent |

Control Center provides deployment templates via Update Service — not direct infrastructure provisioning (Phase 3 exception: managed hosting tier).

---

## Environment Matrix

| Environment | Purpose | Infrastructure |
|-------------|---------|----------------|
| `local` | Developer | Docker Compose |
| `staging` | Pre-production testing | Railway / DO |
| `production-seed` | First 10 clients | DO App Platform |
| `production` | 100+ clients | AWS EKS / Azure AKS |
| `dr` | Disaster recovery | Secondary region standby |

---

## Best Practices

- Infrastructure as Code (Terraform) for cloud deployments
- Separate AWS/GCP accounts per environment
- Blue-green deployments for Control Center itself
- Database migrations run before traffic shift
- Control Center updates independent of client ERP update cycle

---

## Security Notes

- Private subnets for database and Redis
- Bastion or SSM for emergency access — no public DB ports
- WAF on all public endpoints
- Container image scanning in CI pipeline

Detail: [13 — Security Architecture](./13_Security.md)

---

## Future Improvements

| Improvement | Phase |
|-------------|-------|
| Terraform modules for AWS/Azure/DO | Phase 2 |
| Multi-region active-active Control Center | Phase 3 |
| Managed client hosting tier (AgainSoft-operated) | Phase 3 |

---

## Summary

Control Center deploys as Docker containers — Docker Compose for seed/staging, Kubernetes for production scale. Cloud providers (Railway, DigitalOcean, AWS, Azure) map to growth stages; hybrid cloud with CDN edge and regional DR supports enterprise scale. Clients remain on their own infrastructure; Control Center is AgainSoft-operated only.

**Next:** [16 — Project Structure](./16_Project_Structure.md)
