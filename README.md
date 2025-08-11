# Atlas Analítica — Mini Skeleton

## Dev
```bash
npm i
cp .env.example .env
# Ajuste a DATABASE_URL
npm run db:generate
npm run db:migrate
npm run seed
npm run dev
# http://localhost:3000  (GET /api/health para testar)
