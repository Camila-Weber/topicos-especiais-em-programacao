# Ditado

Aplicacao web full stack para transcrever arquivos de audio em texto, manter um historico privado do usuario, reproduzir o audio enviado, baixar o arquivo original e excluir transcricoes.

O sistema foi desenvolvido conforme a especificacao em `ESPECIFICACAO.md` e o plano de acompanhamento em `PLANO_DE_ACAO.md`.

## Visao Geral

O Ditado possui tres perfis de uso:

- Visitante: acessa a landing page, cadastro e login.
- Usuario autenticado: envia audios, consulta historico, ve detalhes, reproduz, baixa e exclui suas proprias transcricoes.
- Administrador: alem das funcoes de usuario, lista contas e ativa/desativa usuarios.

Arquitetura:

- Frontend: React, Vite, TypeScript, React Router, Axios e Zustand.
- Backend: NestJS, TypeORM, JWT, bcryptjs, class-validator e Multer.
- Banco de dados: PostgreSQL 17.
- Transcricao: Groq com modelo Whisper.
- Armazenamento: arquivos de audio em diretorio privado do backend.

Fluxo tecnico resumido:

```text
Navegador -> Frontend Vite -> Proxy /api -> Backend NestJS
                                      |-> PostgreSQL
                                      |-> storage privado de audio
                                      |-> Groq Whisper
```

## Funcionalidades

- Landing page publica.
- Cadastro com validacao de nome, e-mail e senha forte.
- Login com JWT de curta duracao.
- Logout e limpeza da sessao local.
- Protecao de rotas privadas.
- Upload de um arquivo de audio por vez.
- Envio do audio ao backend para transcricao via Groq.
- Historico privado de transcricoes.
- Detalhe da transcricao com texto completo.
- Player autenticado usando Blob URL temporaria.
- Download autenticado do audio original.
- Exclusao da transcricao e do arquivo fisico associado.
- Area administrativa para ativar/desativar usuarios.

## Rotas do Frontend

- `/`: landing page.
- `/cadastro`: cadastro de usuario.
- `/entrar`: login.
- `/app`: nova transcricao.
- `/app/historico`: historico do usuario autenticado.
- `/app/transcricoes/:id`: detalhe da transcricao.
- `/app/admin/usuarios`: administracao de usuarios.

Rotas iniciadas por `/app` exigem usuario autenticado. A rota administrativa exige usuario com papel `admin`.

## Endpoints da API

- `GET /api/health`: verificacao de saude da API.
- `POST /api/auth/register`: cadastro.
- `POST /api/auth/login`: login.
- `GET /api/auth/me`: dados da sessao autenticada.
- `POST /api/transcriptions`: cria transcricao a partir de upload de audio.
- `GET /api/transcriptions`: lista historico do usuario.
- `GET /api/transcriptions/:id`: busca detalhe da transcricao.
- `GET /api/transcriptions/:id/audio`: retorna audio para reproducao.
- `GET /api/transcriptions/:id/audio/download`: baixa audio original.
- `DELETE /api/transcriptions/:id`: remove transcricao e arquivo.
- `GET /api/users`: lista usuarios, apenas admin.
- `PATCH /api/users/:id`: altera status `active`, apenas admin.

## Regras de Negocio

- O cadastro sempre cria usuario com `role = user` e `active = true`.
- O cliente nao pode definir `role` nem `active` no cadastro.
- O e-mail e normalizado antes de salvar.
- Senhas devem ter pelo menos 8 caracteres, letra, numero e caractere especial.
- A senha nunca e armazenada em texto puro; somente `passwordHash`.
- `passwordHash` nunca deve aparecer em respostas da API.
- Login de conta inativa retorna `403 ACCOUNT_INACTIVE`.
- Login invalido retorna `401 INVALID_CREDENTIALS`.
- O JWT expira em 5 minutos.
- Nao ha refresh token neste MVP.
- Token expirado retorna `401 TOKEN_EXPIRED`; o frontend limpa a sessao e volta para `/entrar`.
- Cada transcricao pertence a um unico usuario.
- Usuarios comuns nao acessam, reproduzem, baixam ou excluem transcricoes de outros usuarios.
- Recurso de outro usuario deve retornar `404`.
- Administradores podem alterar apenas o campo `active` de usuarios.
- Mudanca de `role` nao faz parte do MVP.

## Regras de Audio e Transcricao

- O upload exige autenticacao.
- Apenas um arquivo deve ser enviado por vez.
- O tamanho maximo permitido e 25 MB.
- Formatos aceitos: `mp3`, `m4a`, `wav`, `ogg`, `webm`, `flac`, `mp4` e `mpeg`.
- O arquivo e salvo em diretorio privado do backend.
- O nome fisico do arquivo e gerado pelo servidor.
- O nome original nao controla o caminho fisico.
- Caminhos internos e `storedFileName` nao sao expostos ao frontend.
- A Groq e chamada somente pelo backend.
- Se a transcricao falhar antes da persistencia, o arquivo salvo deve ser removido.
- Sem `GROQ_API_KEY`, um upload valido deve falhar de forma controlada com `502 TRANSCRIPTION_PROVIDER_ERROR`.

## Requisitos Locais

- Node.js compativel com o projeto.
- npm.
- Docker e Docker Compose.
- PostgreSQL via Docker Compose.
- Chave da Groq apenas se quiser validar transcricao real.

Para conferir Docker:

```bash
docker --version
docker compose version
```

Se estiver usando WSL, o Docker Desktop precisa estar aberto e com a integracao WSL habilitada para a distribuicao Linux usada no terminal.

## Configuracao

Entre na pasta do projeto:

```bash
cd /topicos-especiais-em-programacao/aula07
```

Instale as dependencias do backend:

```bash
cd backend
npm install
```

Instale as dependencias do frontend:

```bash
cd ../frontend
npm install
```

Crie o arquivo de ambiente local do backend:

```bash
cd ..
cp .env.example backend/.env
```

Edite `backend/.env` e ajuste pelo menos:

```env
JWT_SECRET=troque-por-um-valor-local-seguro
GROQ_API_KEY=sua-chave-groq-opcional-para-transcricao-real
```

O arquivo `.env` nao deve ser versionado.

## Como Subir o Sistema

Na raiz do projeto, suba o PostgreSQL:

```bash
docker compose up -d
```

Confira se o banco esta ativo:

```bash
docker compose ps
```

Em um terminal, suba o backend:

```bash
cd backend
npm run start:dev
```

A API ficara disponivel em:

```text
http://localhost:3000/api
```

Em outro terminal, suba o frontend:

```bash
cd frontend
npm run dev -- --host 127.0.0.1
```

O frontend ficara disponivel em:

```text
http://127.0.0.1:5173
```

Teste rapido:

```bash
curl http://localhost:3000/api/health
```

## Como Parar o Sistema

Pare backend e frontend com `Ctrl+C` nos terminais em que eles estao rodando.

Depois, na raiz do projeto:

```bash
docker compose down
```

## Criar um Administrador Local

O cadastro publico cria apenas usuarios comuns. Para testes locais de administracao:

1. Cadastre um usuario pela tela `/cadastro`.
2. Promova esse usuario diretamente no banco local:

```bash
docker exec -it ditado-postgres psql -U ditado -d ditado
```

No prompt do PostgreSQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'seu@email.com';
```

Use esse procedimento apenas em ambiente local de desenvolvimento.

## Testes e Build

Backend:

```bash
cd backend
npm test -- --runInBand
npm run build
```

Frontend:

```bash
cd frontend
npm run build
```

Validacoes ja executadas no plano:

- Testes automatizados do backend.
- Builds de backend e frontend.
- Teste HTTP real com PostgreSQL.
- Validacao de isolamento entre usuarios.
- Validacao de token expirado.
- Validacao de fluxo administrativo.

Pendencia conhecida:

- Transcricao real bem-sucedida depende de configurar `GROQ_API_KEY`.

## Seguranca

- Nunca versionar `.env`.
- Nunca colocar `GROQ_API_KEY` no frontend.
- Nunca chamar Groq pelo navegador.
- Nao expor senha, `passwordHash`, token completo, chaves ou caminhos internos em logs/respostas.
- Audios devem ficar em pasta privada do backend.
- Reproducao, download, detalhe e exclusao sempre verificam autenticacao e propriedade.
- Recursos de outro usuario retornam `404`.
- Erros nao devem retornar stack trace para o cliente.

## Observacoes de Desenvolvimento

- O projeto usa PostgreSQL pelo `docker-compose.yml`.
- O backend le variaveis de ambiente a partir de `backend/.env`.
- O frontend usa proxy `/api` para chamar o backend durante o desenvolvimento.
- O storage local de audio fica no backend e e ignorado pelo Git.
- O plano de execucao por etapas esta em `PLANO_DE_ACAO.md`.
- A especificacao funcional e tecnica esta em `ESPECIFICACAO.md`.
