# dex-binder starter

Full-stack starter boilerplate for a Pokémon card placeholder sheet generator.

## Stack

- **Backend:** NestJS (`apps/backend`)
- **Frontend:** Vue 3 + Vite + TailwindCSS (`apps/frontend`)
- **Database:** PostgreSQL + Prisma ORM (`apps/backend/prisma`)
- **Import script:** CSV importer with Pokémon TCG API image enrichment (`apps/backend/scripts/import-cards.ts`)

## Folder structure

```text
apps/
  backend/
    prisma/
    scripts/
    src/
  frontend/
    src/
docker-compose.yml
```

## Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start PostgreSQL:

   ```bash
   docker compose up -d
   ```

3. Configure backend env:

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```

4. Generate Prisma client and run migration:

   ```bash
   cd apps/backend
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. Start backend and frontend (in separate terminals):

   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```

   Frontend: http://localhost:5173
   Backend: http://localhost:3000

## CSV import

From `apps/backend`, run:

```bash
npm run import:cards -- ./path/to/cards.csv
```

Expected CSV headers (flexible aliases supported):

- `id` (Pokémon TCG card id, e.g. `base1-4`)
- `name`
- `set` or `setName`
- `number`
- `rarity` (optional)
- `imageUrl` / `imageSmallUrl` (optional fallback)

The importer upserts cards and fetches image URLs from the Pokémon TCG API when an `id` is provided.
