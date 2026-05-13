# SmåJobb POC

Marketplace for småjobber rettet mot unge arbeidstakere (13+).
Demonstrasjon-POC, ikke designet for ekte brukere.

## Stack

- **Backend:** .NET 10, ASP.NET Core (Controllers), EF Core Code First
- **Database:** SQL Server (Azure SQL Edge lokalt på Apple Silicon)
- **Frontend:** Angular (standalone components + signals), Tailwind CSS + Angular CDK
- **Auth:** ASP.NET Core Identity + JWT access tokens + HttpOnly refresh-cookie
- **Betaling:** Stripe Checkout (test-modus)
- **E-post:** SendGrid (prod), smtp4dev (lokal dev)
- **Bildelagring:** `IBlobStorage` med lokal disk (dev) / Hetzner Object Storage (prod)
- **Hosting:** Hetzner Cloud VPS med Docker Compose + Caddy

## Slice 1 (i arbeid)

Voksen-til-voksen happy path: utlyser → arbeider → jobb fullført med rating begge veier.
Foresatt/barn-flyt og mindreårige arbeidere kommer i slice 2.

## Forutsetninger

| Verktøy | Hvordan installere på macOS |
|---|---|
| .NET 10 SDK | `brew install --cask dotnet-sdk` |
| Angular CLI | `npm install -g @angular/cli` |
| Docker | `brew install --cask docker` (Desktop) eller `brew install colima docker docker-compose` |
| Node.js (allerede installert) | — |

## Lokal utvikling

```bash
# 1. Start avhengigheter (SQL Server + smtp4dev)
docker compose -f docker-compose.dev.yml up -d

# 2. Backend (kommer etter scaffolding)
cd server
dotnet watch run

# 3. Frontend (kommer etter scaffolding)
cd client
ng serve
```

### Tilgang under utvikling

| Tjeneste | URL / port |
|---|---|
| API | http://localhost:5000 |
| Angular dev server | http://localhost:4200 |
| SQL Server | localhost:1433 (sa / `Local_dev_passord_2026!`) |
| smtp4dev web-UI | http://localhost:3001 |

### Stripe-webhooks lokalt

Når Stripe-integrasjon er på plass:

```bash
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

## Prosjektstruktur

```
POC_SmaaJobb/
├── server/                      ASP.NET Core Web API
├── client/                      Angular workspace
├── docker-compose.dev.yml       Lokale avhengigheter
└── .github/workflows/           CI/CD (kommer senere)
```

## Juridisk modell (kort)

Ren formidlingsplattform — privat-til-privat. Plattformen er teknisk infrastruktur, ikke
arbeidsgiver. Foreslår priser men fastsetter dem ikke. 5%-avgift kreves i forskudd fra
utlyser; selve jobbprisen avtales og betales direkte mellom partene (Vipps).
Arbeidere fra 13+ år håndteres via foresatt-flyt og jobbkategorier med aldersgater.

## Status

I scaffolding-fase. Se [TODO](#) eller spør Claude.
