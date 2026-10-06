# Ditado

Aplicação web full stack para transcrever arquivos de áudio em texto, manter um histórico privado do usuário, reproduzir o áudio enviado, baixar o arquivo original e excluir transcrições.

O sistema foi desenvolvido conforme a especificação em `ESPECIFICACAO.md` e o plano de acompanhamento em `PLANO_DE_ACAO.md`.

## Visão Geral

O Ditado possui três perfis de uso:

- Visitante: acessa a landing page, cadastro e login.
- Usuário autenticado: envia áudios, consulta histórico, vê detalhes, reproduz, baixa e exclui suas próprias transcrições.
- Administrador: além das funções de usuário, lista contas e ativa/desativa usuários.

Arquitetura:

- Frontend: React, Vite, TypeScript, React Router, Axios e Zustand.
- Backend: NestJS, TypeORM, JWT, bcryptjs, class-validator e Multer.
- Banco de dados: PostgreSQL 17.
- Transcrição: Groq com modelo Whisper.
- Armazenamento: arquivos de áudio em diretório privado do backend.

Fluxo técnico resumido:

```text
Navegador -> Frontend Vite -> Proxy /api -> Backend NestJS
                                      |-> PostgreSQL
                                      |-> storage privado de áudio
                                      |-> Groq Whisper
```

## Funcionalidades

- Landing page pública.
- Cadastro com validação de nome, e-mail, senha forte e login automático após criação da conta.
- Login com JWT de curta duração.
- Logout e limpeza da sessão local.
- Proteção de rotas privadas.
- Navegação privada persistente entre nova transcrição, histórico e administração.
- Upload de um arquivo de áudio/vídeo por vez, com seleção por clique ou arrastar e soltar.
- Envio do áudio ao backend para transcrição via Groq.
- Histórico privado de transcrições com busca, filtros e paginação.
- Detalhe da transcrição com texto completo.
- Player autenticado usando Blob URL temporária.
- Download autenticado do áudio original.
- Exclusão da transcrição e do arquivo físico associado.
- Área administrativa para ativar/desativar usuários.
- Mensagens e campos visíveis em português do Brasil.

## Rotas do Frontend

- `/`: landing page.
- `/cadastro`: cadastro de usuário.
- `/entrar`: login.
- `/app`: nova transcrição.
- `/app/historico`: histórico do usuário autenticado.
- `/app/transcricoes/:id`: detalhe da transcrição.
- `/app/admin/usuarios`: administração de usuários.

Rotas iniciadas por `/app` exigem usuário autenticado. A rota administrativa exige usuário com papel `admin`.

Dentro da área autenticada, o cabeçalho exibe navegação persistente:

- `Nova transcrição`: abre `/app`.
- `Histórico`: abre `/app/historico`, mesmo que o usuário ainda não tenha enviado arquivos.
- `Usuários`: abre `/app/admin/usuarios`, somente para administradores.
- `Sair`: encerra a sessão local e volta para `/entrar`.

## Endpoints da API

- `GET /api/health`: verificação de saúde da API.
- `POST /api/auth/register`: cadastro; em caso de sucesso, retorna usuário, token JWT e expiração.
- `POST /api/auth/login`: login.
- `GET /api/auth/me`: dados da sessão autenticada.
- `POST /api/transcriptions`: cria transcrição a partir de upload de áudio/vídeo.
- `GET /api/transcriptions`: lista histórico paginado do usuário.
- `GET /api/transcriptions/:id`: busca detalhe da transcrição.
- `GET /api/transcriptions/:id/audio`: retorna áudio para reprodução.
- `GET /api/transcriptions/:id/audio/download`: baixa áudio original.
- `DELETE /api/transcriptions/:id`: remove transcrição e arquivo.
- `GET /api/users`: lista usuários, apenas admin.
- `PATCH /api/users/:id`: altera status `active`, apenas admin.

## Regras de Negócio

- O cadastro sempre cria usuário com `role = user` e `active = true`.
- O cliente não pode definir `role` nem `active` no cadastro.
- Cadastro bem-sucedido já inicia sessão e redireciona o usuário para `/app`.
- O e-mail é normalizado antes de salvar.
- Senhas devem ter pelo menos 8 caracteres, letra, número e caractere especial.
- A senha nunca é armazenada em texto puro; somente `passwordHash`.
- `passwordHash` nunca deve aparecer em respostas da API.
- Erros de cadastro, como e-mail duplicado ou senha fraca, não retornam token.
- Login de conta inativa retorna `403 ACCOUNT_INACTIVE`.
- Login inválido retorna `401 INVALID_CREDENTIALS`.
- O JWT expira em 5 minutos.
- Não há refresh token neste MVP.
- Token expirado retorna `401 TOKEN_EXPIRED`; o frontend limpa a sessão e volta para `/entrar`.
- Cada transcrição pertence a um único usuário.
- Usuários comuns não acessam, reproduzem, baixam ou excluem transcrições de outros usuários.
- Recurso de outro usuário deve retornar `404`.
- Administradores podem alterar apenas o campo `active` de usuários.
- Mudança de `role` não faz parte do MVP.

## Regras de Áudio e Transcrição

- O upload exige autenticação.
- Apenas um arquivo deve ser enviado por vez.
- O tamanho máximo permitido é 25 MB.
- Formatos aceitos: `mp3`, `m4a`, `wav`, `ogg`, `webm`, `flac`, `mp4` e `mpeg`.
- A tela de envio permite selecionar arquivo por clique ou arrastar e soltar na área de upload.
- O idioma deve ser escolhido em um select com nomes completos.
- Idiomas disponíveis: Português (`pt`), Inglês (`en`), Espanhol (`es`), Francês (`fr`), Alemão (`de`) e Italiano (`it`).
- A API recebe a sigla do idioma e rejeita valores fora da lista com `400 INVALID_LANGUAGE`.
- O arquivo é salvo em diretório privado do backend.
- O nome físico do arquivo é gerado pelo servidor.
- O nome original não controla o caminho físico.
- Caminhos internos e `storedFileName` não são expostos ao frontend.
- A Groq é chamada somente pelo backend.
- Se a transcrição falhar antes da persistência, o arquivo salvo deve ser removido.
- Sem `GROQ_API_KEY`, um upload válido deve falhar de forma controlada com `502 TRANSCRIPTION_PROVIDER_ERROR`.

## Histórico Paginado

O histórico em `/app/historico` consulta `GET /api/transcriptions` com filtros opcionais:

- `page`: página atual. Padrão: `1`.
- `pageSize`: itens por página. Padrão: `10`; máximo: `50`.
- `q`: busca por nome do arquivo ou texto transcrito.
- `language`: filtra por idioma (`pt`, `en`, `es`, `fr`, `de`, `it`).
- `dateFrom`: data inicial no formato `YYYY-MM-DD`.
- `dateTo`: data final no formato `YYYY-MM-DD`.

Exemplo:

```text
GET /api/transcriptions?page=1&pageSize=10&q=reuniao&language=pt
```

Formato da resposta:

```json
{
  "data": [
    {
      "id": "uuid-da-transcricao",
      "originalFileName": "reuniao.mp3",
      "fileSize": 123456,
      "language": "pt",
      "textPreview": "Trecho inicial da transcrição...",
      "createdAt": "2026-10-05T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

O histórico continua exibindo apenas transcrições do usuário autenticado e não retorna `storedFileName` nem caminhos internos.

## Mensagens e Localização

- Campos, botões e mensagens visíveis ao usuário usam português do Brasil.
- Mensagens de erro retornadas pela API também foram revisadas com acentuação.
- Rotas, nomes de campos técnicos, MIME types e códigos de erro permanecem sem acento para preservar contratos existentes.

## Requisitos Locais

- Node.js compatível com o projeto.
- npm.
- Docker e Docker Compose.
- PostgreSQL via Docker Compose.
- Chave da Groq apenas se quiser validar transcrição real.

Para conferir Docker:

```bash
docker --version
docker compose version
```

Se estiver usando WSL, o Docker Desktop precisa estar aberto e com a integração WSL habilitada para a distribuição Linux usada no terminal.

## Configuração

Entre na pasta do projeto:

```bash
cd /home/camila/tep/aula07/topicos-especiais-em-programacao/aula07
```

Instale as dependências do backend:

```bash
cd backend
npm install
```

Instale as dependências do frontend:

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
GROQ_TRANSCRIPTION_MODEL=whisper-large-v3-turbo
```

O arquivo `.env` não deve ser versionado.

## Como Subir o Sistema

Na raiz do projeto, suba o PostgreSQL:

```bash
docker compose up -d
```

Confira se o banco está ativo:

```bash
docker compose ps
```

Em um terminal, suba o backend:

```bash
cd backend
npm run start:dev
```

A API ficará disponível em:

```text
http://localhost:3000/api
```

Em outro terminal, suba o frontend:

```bash
cd frontend
npm run dev -- --host 127.0.0.1
```

O frontend ficará disponível em:

```text
http://127.0.0.1:5173
```

Teste rápido:

```bash
curl http://localhost:3000/api/health
```

## Como Parar o Sistema

Pare backend e frontend com `Ctrl+C` nos terminais em que eles estão rodando.

Depois, na raiz do projeto:

```bash
docker compose down
```

## Criar um Administrador Local

O cadastro público cria apenas usuários comuns. Para testes locais de administração:

1. Cadastre um usuário pela tela `/cadastro`.
2. Promova esse usuário diretamente no banco local:

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

Validações já executadas no plano:

- Testes automatizados do backend.
- Builds de backend e frontend.
- Teste HTTP real com PostgreSQL.
- Validação de isolamento entre usuários.
- Validação de token expirado.
- Validação de fluxo administrativo.

Pendências conhecidas:

- Transcrição real bem-sucedida depende de configurar `GROQ_API_KEY`.
- Validação visual/manual no navegador ainda deve ser feita para alguns fluxos.

## Segurança

- Nunca versionar `.env`.
- Nunca colocar `GROQ_API_KEY` no frontend.
- Nunca chamar Groq pelo navegador.
- Não expor senha, `passwordHash`, token completo, chaves ou caminhos internos em logs/respostas.
- Áudios devem ficar em pasta privada do backend.
- Reprodução, download, detalhe e exclusão sempre verificam autenticação e propriedade.
- Recursos de outro usuário retornam `404`.
- Erros não devem retornar stack trace para o cliente.

## Observações de Desenvolvimento

- O projeto usa PostgreSQL pelo `docker-compose.yml`.
- O backend lê variáveis de ambiente a partir de `backend/.env`.
- O frontend usa proxy `/api` para chamar o backend durante o desenvolvimento.
- O storage local de áudio fica no backend e é ignorado pelo Git.
- O plano de execução por etapas está em `PLANO_DE_ACAO.md`.
- A especificação funcional e técnica está em `ESPECIFICACAO.md`.
