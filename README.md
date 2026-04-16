# OpenSeam Discovery OS

A full-stack discovery platform for validating market demand, capturing customer insights, and scoring opportunities — built as a TypeScript monorepo.

## Architecture

```
openseam/
├── apps/
│   ├── api/          # NestJS REST API (port 3001)
│   └── web/          # React + Vite SPA (port 5173)
├── packages/
│   └── shared/       # Shared TypeScript types
└── .github/
    └── workflows/    # GitHub Actions CI/CD
```

## Core Modules

| Module | Description |
|--------|-------------|
| **CRM** | Accounts, Contacts, Leads, Opportunities with pipeline stages |
| **Interview Engine** | Reusable templates, scheduled/completed/analyzed workflow |
| **Evidence Repository** | Categorized evidence linked to interviews & accounts |
| **Thesis Tracker** | Hypothesis management (unvalidated → validated/invalidated) |
| **Architecture Intake** | Multi-step questionnaire capturing cloud/infra stack |
| **Scoring Engine** | Weighted 10-dimension scoring model with ratings |

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, React Query, React Router, Lucide Icons
- **Backend**: NestJS 10, TypeScript, Swagger/OpenAPI
- **Database**: PostgreSQL via Prisma ORM
- **Shared**: TypeScript interfaces package (`@openseam/shared`)
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd openseam
npm install --legacy-peer-deps

# 2. Configure environment
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your DATABASE_URL

cp apps/web/.env.example apps/web/.env

# 3. Set up database
cd apps/api
npx prisma migrate dev --name init
# or npx prisma db push for quick setup

# 4. Start development
cd ../..
npm run dev
```

### API Documentation

Once running, Swagger UI is available at: `http://localhost:3001/api/docs`

## API Endpoints

| Resource | Endpoints |
|----------|-----------|
| Accounts | `GET/POST /accounts`, `GET/PATCH/DELETE /accounts/:id` |
| Contacts | `GET/POST /contacts`, `GET/PATCH/DELETE /contacts/:id` |
| Leads | `GET/POST /leads`, `GET/PATCH/DELETE /leads/:id` |
| Opportunities | `GET/POST /opportunities`, `GET/PATCH/DELETE /opportunities/:id` |
| Interviews | `GET/POST /interviews`, `GET/PATCH /interviews/:id` |
| Templates | `GET/POST /interviews/templates`, `GET/PATCH /interviews/templates/:id` |
| Evidence | `GET/POST /evidence`, `GET/PATCH/DELETE /evidence/:id` |
| Hypotheses | `GET/POST /hypotheses`, `GET/PATCH /hypotheses/:id` |
| Intake | `GET/POST /intake`, `GET/PATCH/DELETE /intake/:id`, `POST /intake/:id/submit` |
| Scoring | `GET /scoring`, `POST /scoring/calculate`, `GET /scoring/rankings`, `PATCH /scoring/weights` |

## Scoring Model

The opportunity scoring engine uses 10 weighted dimensions:

| Dimension | Weight |
|-----------|--------|
| Strategic Fit | 20% |
| Cloud Complexity | 15% |
| Vendor Lock-in Risk | 15% |
| Revenue Potential | 15% |
| Technical Maturity | 10% |
| Urgency | 10% |
| Regulatory Pressure | 5% |
| Innovation Readiness | 5% |
| Design Partner Potential | 3% |
| Reference Value | 2% |

**Ratings**: Low (<40) | Medium (40–60) | High (60–80) | Strategic (>80)

## Building

```bash
# Build all
npm run build

# Build individual packages
npm run build --workspace=packages/shared
npm run build --workspace=apps/api
npm run build --workspace=apps/web
```

## CI/CD

GitHub Actions runs on push to `main`/`develop` and on pull requests:
- TypeScript compilation check for all packages
- Prisma client generation
- API build verification
- Web build verification
- API tests with PostgreSQL service container
