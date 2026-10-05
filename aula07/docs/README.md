# Ditado

Projeto full stack para transcricao de audios, baseado em `ESPECIFICACAO.md` e acompanhado por `PLANO_DE_ACAO.md`.

## Desenvolvimento local

1. Copie `.env.example` para `backend/.env` ou exporte as variaveis no ambiente.
2. Suba o banco:

```bash
docker compose up -d
```

3. Instale e rode o backend:

```bash
cd backend
npm install
npm run start:dev
```

4. Instale e rode o frontend:

```bash
cd frontend
npm install
npm run dev
```

O frontend usa proxy `/api` para o backend em `http://localhost:3000`.
