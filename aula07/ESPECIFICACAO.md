# ESPECIFICAÇÃO DO PROJETO — DITADO

> **Documento:** `docs/ESPECIFICACAO.md`  
> **Versão:** 2.0  
> **Status:** Especificação funcional e técnica para implementação  
> **Objetivo do documento:** definir o que será construído, quais dados serão tratados, como as responsabilidades serão divididas, quais contratos deverão ser respeitados e quais critérios objetivos determinam que cada etapa está concluída.

---

# 1. Identificação do projeto

**Nome do sistema:** Ditado  
**Tipo:** Aplicação web full stack  
**Finalidade principal:** Transcrição de arquivos de áudio para texto  
**Arquitetura:** Frontend + API REST + Banco de Dados + Armazenamento de Áudio + Serviço Externo de Transcrição  
**Perfis de acesso:** Visitante, Usuário autenticado e Administrador

---

# 2. Visão geral do produto

O **Ditado** é uma aplicação web que permite a um visitante conhecer o produto por meio de uma landing page, cadastrar uma conta e autenticar-se.

Depois do login, o usuário poderá:

1. selecionar um arquivo de áudio;
2. enviá-lo ao backend;
3. solicitar sua transcrição;
4. receber o texto transcrito;
5. manter o áudio e o texto associados no histórico pessoal;
6. abrir uma transcrição posteriormente;
7. reproduzir novamente o áudio enviado;
8. baixar o arquivo de áudio original;
9. comparar o áudio com a transcrição;
10. excluir a transcrição e o arquivo correspondente.

As transcrições e os áudios pertencem ao usuário que os enviou. Um usuário comum nunca deve ter acesso aos conteúdos de outro usuário.

O sistema possuirá também um perfil **Administrador**, responsável pela gestão das contas cadastradas.

A aplicação será organizada em quatro componentes principais:

1. **Frontend** — interface executada no navegador;
2. **Backend/API REST** — regras de negócio, autenticação, autorização, validações, streaming e download dos áudios e integração externa;
3. **PostgreSQL** — persistência dos dados estruturados;
4. **Armazenamento de arquivos do backend** — persistência dos arquivos de áudio enviados.

Além desses componentes, o backend se comunicará com a **Groq**, utilizando um modelo Whisper para executar a transcrição.

---

# 3. Objetivos

## 3.1 Objetivo geral

Disponibilizar uma aplicação web segura, organizada e de fácil utilização para transformar arquivos de áudio em texto, mantendo um histórico privado em que o usuário possa consultar a transcrição, reproduzir o áudio original e baixá-lo posteriormente.

## 3.2 Objetivos específicos

- permitir cadastro de usuários;
- validar os dados do cadastro no frontend e no backend;
- exigir senha forte;
- autenticar usuários por e-mail e senha;
- emitir JWT com validade máxima de 5 minutos;
- impedir uso de token expirado;
- proteger rotas privadas;
- controlar acesso administrativo por papel;
- receber arquivos de áudio;
- validar formato, tipo e tamanho dos arquivos;
- armazenar com segurança o áudio no backend;
- enviar o áudio para a Groq;
- armazenar o texto retornado;
- associar áudio e transcrição ao usuário proprietário;
- disponibilizar reprodução do áudio;
- permitir download do áudio original;
- manter histórico individual;
- impedir acesso horizontal entre usuários;
- permitir exclusão conjunta do registro e do arquivo;
- apresentar mensagens compreensíveis aos usuários;
- não expor detalhes internos ou segredos;
- manter as responsabilidades de cada camada claramente separadas;
- garantir critérios verificáveis de aceite para cada etapa.

---

# 4. Escopo

## 4.1 Funcionalidades incluídas no MVP

O MVP deverá possuir:

- landing page;
- cadastro;
- validação de senha no frontend;
- validação de senha no backend;
- login;
- JWT com expiração de 5 minutos;
- logout;
- tratamento visual de sessão expirada;
- área autenticada;
- seleção e upload de áudio;
- armazenamento do arquivo no backend;
- validação do áudio;
- integração com Groq;
- persistência da transcrição;
- histórico pessoal;
- visualização de detalhes;
- reprodução do áudio no navegador;
- download do arquivo de áudio;
- exclusão da transcrição;
- exclusão física do áudio associado;
- administração de contas;
- ativação/desativação de usuários;
- proteção de rotas;
- tratamento padronizado de erros;
- estados de carregamento;
- feedback de sucesso, vazio e falha;
- persistência dos dados em PostgreSQL.

## 4.2 Fora do escopo inicial

Não fazem parte do MVP:

- pagamentos;
- assinaturas;
- cobrança por minuto;
- planos comerciais;
- compartilhamento público de transcrições;
- compartilhamento entre usuários;
- transcrição em tempo real;
- edição colaborativa;
- resumos por IA;
- identificação automática de falantes;
- tradução automática;
- exportação de texto para PDF/DOCX;
- recuperação de senha por e-mail;
- autenticação social;
- refresh token;
- renovação automática silenciosa do JWT;
- painel analítico;
- upload simultâneo de múltiplos arquivos;
- armazenamento de arquivos em serviço externo como S3.

### Decisão sobre autenticação

Nesta versão, **não haverá refresh token**.

O JWT de acesso terá validade de **5 minutos**. Quando expirar, uma nova requisição protegida retornará `401` e o frontend deverá encerrar a sessão local e solicitar novo login.

Essa decisão mantém o escopo de autenticação simples e deixa explícito o comportamento esperado.

---

# 5. Perfis e permissões

## 5.1 Visitante

Pode:

- acessar `/`;
- visualizar a apresentação do produto;
- acessar `/cadastro`;
- criar conta;
- acessar `/entrar`;
- autenticar-se.

Não pode:

- acessar `/app`;
- enviar áudio;
- reproduzir áudio privado;
- baixar áudio privado;
- acessar histórico;
- acessar administração.

## 5.2 Usuário autenticado

Pode:

- acessar a área interna;
- enviar arquivo;
- solicitar transcrição;
- visualizar a própria transcrição;
- visualizar o próprio histórico;
- reproduzir o próprio áudio;
- baixar o próprio áudio;
- excluir a própria transcrição e arquivo;
- realizar logout.

Não pode:

- acessar transcrição de outro usuário;
- reproduzir áudio de outro usuário;
- baixar áudio de outro usuário;
- acessar endpoints administrativos;
- alterar o próprio papel;
- alterar o próprio status administrativo.

## 5.3 Administrador

Pode:

- executar as funções comuns de usuário;
- acessar área administrativa;
- listar contas;
- consultar dados cadastrais permitidos;
- ativar e desativar usuários.

Não pode obter pela API:

- senha;
- `passwordHash`;
- `JWT_SECRET`;
- `GROQ_API_KEY`;
- caminhos físicos internos de arquivos.

---

# 6. Requisitos funcionais

## RF01 — Landing page

O sistema deve possuir página pública de apresentação contendo:

- marca/nome Ditado;
- explicação da proposta;
- apresentação do fluxo;
- chamada para criação de conta;
- acesso ao login.

## RF02 — Cadastro

O visitante deve poder criar conta informando:

- nome;
- e-mail;
- senha;
- confirmação da senha.

## RF03 — Política de senha

A senha deve possuir, obrigatoriamente:

- no mínimo 8 caracteres;
- pelo menos uma letra;
- pelo menos um número;
- pelo menos um caractere especial.

Exemplo aceito:

```text
Ditado@2026
```

Exemplos rejeitados:

```text
12345678
abcdefgh
senha123
Senha123
```

### Validação no frontend

O formulário deve validar a senha antes do envio.

Enquanto os critérios não forem atendidos, deve mostrar indicação clara, por exemplo:

```text
A senha precisa conter:
✓ pelo menos 8 caracteres
✓ uma letra
✓ um número
✓ um caractere especial
```

O botão poderá permanecer desabilitado enquanto o formulário estiver inválido.

### Validação obrigatória no backend

A validação no frontend é apenas uma melhoria de usabilidade.

O backend deve repetir integralmente a política, porque qualquer cliente HTTP pode ignorar o frontend.

## RF04 — Confirmação da senha

O frontend deve impedir envio quando:

```text
password !== confirmPassword
```

`confirmPassword` existe apenas no formulário e não precisa ser persistido.

## RF05 — Perfil padrão

Cadastro público deve criar:

```text
role = user
active = true
```

O cliente não pode determinar esses campos.

## RF06 — Login

Usuário deve autenticar-se com:

- e-mail;
- senha.

## RF07 — Emissão do token

Após login válido, o backend deve emitir JWT com validade de:

```text
5 minutos
```

Configuração esperada:

```text
JWT_EXPIRES_IN=5m
```

## RF08 — Expiração da sessão

Quando o JWT expirar:

- endpoints privados devem responder `401`;
- frontend deve limpar a sessão;
- usuário deve ser redirecionado para `/entrar`;
- deve aparecer uma mensagem informando que a sessão expirou.

## RF09 — Logout

O logout deve remover localmente:

- access token;
- dados do usuário;
- dados de sessão mantidos pelo frontend.

## RF10 — Upload de áudio

Usuário autenticado deve poder selecionar e enviar um único arquivo de áudio.

## RF11 — Validação de áudio

O backend deve validar:

- arquivo presente;
- tamanho;
- extensão permitida;
- MIME permitido;
- nome recebido;
- ausência de tentativa de uso de caminho fornecido pelo cliente.

## RF12 — Armazenamento do áudio

O backend deve armazenar o arquivo recebido de forma persistente.

O arquivo físico deve receber um identificador interno gerado pelo servidor, preferencialmente UUID.

O nome original deve existir apenas como metadado.

Exemplo:

```text
Nome original:
reuniao-equipe.m4a

Nome físico:
550e8400-e29b-41d4-a716-446655440000.m4a
```

## RF13 — Transcrição

Após salvar e validar o arquivo, o backend deve enviá-lo à Groq.

## RF14 — Persistência

Uma transcrição concluída deve armazenar no banco:

- proprietário;
- nome original;
- identificador interno do arquivo;
- MIME;
- tamanho;
- extensão;
- idioma;
- texto transcrito;
- data.

## RF15 — Resultado

Após conclusão, a tela deve apresentar:

- texto;
- nome do áudio;
- controle de reprodução;
- opção de download.

## RF16 — Histórico

Usuário deve visualizar somente suas próprias transcrições.

Ordem:

```text
createdAt DESC
```

## RF17 — Detalhes da transcrição

Na tela de detalhes devem estar disponíveis:

- nome original;
- data;
- idioma;
- texto completo;
- player de áudio;
- botão para download;
- botão para exclusão.

## RF18 — Reprodução

Usuário deve poder reproduzir o áudio diretamente no navegador.

O player deve possuir controles nativos ou equivalentes para:

- play;
- pause;
- duração;
- posição;
- volume.

## RF19 — Validação da transcrição pelo usuário

A disponibilização do áudio junto ao texto tem como finalidade permitir ao usuário ouvir o conteúdo original e comparar com a transcrição produzida.

O sistema não precisa possuir uma função automática de “aprovar”, mas a interface deve permitir comparação simples entre áudio e texto.

## RF20 — Download

Usuário deve poder baixar seu arquivo original.

O download deve utilizar:

```text
Content-Disposition: attachment
```

com nome de arquivo adequado para o usuário.

## RF21 — Propriedade do áudio

O endpoint de reprodução/download deve verificar o proprietário no backend.

Conhecer o UUID de uma transcrição ou arquivo não concede acesso.

## RF22 — Exclusão

Ao excluir uma transcrição:

1. verificar proprietário;
2. excluir ou marcar o registro conforme fluxo definido;
3. remover o arquivo físico associado;
4. não deixar arquivos órfãos conhecidos pelo sistema.

Nesta versão, a exclusão será definitiva.

## RF23 — Área administrativa

Administrador deve poder listar usuários.

## RF24 — Status da conta

Administrador deve poder ativar/desativar conta.

## RF25 — Conta inativa

Conta inativa não pode realizar login.

## RF26 — Tratamento de falha externa

Falhas da Groq devem ser traduzidas para erro controlado.

## RF27 — Feedback visual

Operações devem apresentar:

- idle;
- loading;
- success;
- empty;
- error.

---

# 7. Requisitos não funcionais

## RNF01 — Segurança

Validação, autenticação, autorização, proteção de segredo e controle de propriedade devem existir no backend.

## RNF02 — Usabilidade

Mensagens técnicas não devem ser apresentadas diretamente ao usuário.

## RNF03 — Responsividade

Páginas devem funcionar em desktop e dispositivos móveis.

## RNF04 — Integridade

Banco e armazenamento físico devem permanecer coerentes.

Um registro não deve apontar para arquivo inexistente em condições normais.

## RNF05 — Manutenibilidade

Responsabilidades devem ser divididas por módulo e camada.

## RNF06 — Validação redundante

Validações importantes devem existir no frontend para experiência e no backend para segurança.

## RNF07 — Segredos

Segredos ficam somente no backend.

## RNF08 — Privacidade

Áudios não podem ser servidos por diretório público sem autenticação.

## RNF09 — Rastreabilidade

Erros internos podem ser registrados no backend sem dados sensíveis.

## RNF10 — Consistência

Falhas no armazenamento, transcrição ou banco devem ser tratadas de forma que o sistema evite registros incompletos ou arquivos órfãos.

---

# 8. Regras de negócio

## RN01 — E-mail único

Cada e-mail identifica uma única conta.

## RN02 — Normalização de e-mail

Antes de validar duplicidade/login:

```text
trim()
toLowerCase()
```

## RN03 — Política de senha

Expressa conceitualmente por:

```text
mínimo 8
+ letra
+ número
+ caractere especial
```

O frontend e o backend devem aplicar a mesma regra.

## RN04 — Senha nunca persistida

Persistir somente `passwordHash`.

## RN05 — Papel não controlado pelo cliente

Cadastro nunca aceita `role`.

## RN06 — Token curto

JWT expira após 5 minutos.

## RN07 — Sem refresh token

Após expiração, é necessário autenticar novamente.

## RN08 — Propriedade

Cada transcrição pertence exatamente a um usuário.

## RN09 — Áudio pertence à transcrição

Cada transcrição possui exatamente um áudio nesta versão.

## RN10 — Arquivos suportados

Formatos previstos:

- mp3;
- m4a;
- wav;
- ogg;
- webm;
- flac;
- mp4;
- mpeg.

## RN11 — Tamanho máximo

```text
25 MB
```

## RN12 — Nome físico

Nunca utilizar `originalFileName` diretamente como nome físico sem controle do servidor.

## RN13 — Diretório privado

Arquivos devem ficar fora de qualquer diretório que o frontend ou servidor web publique diretamente.

Exemplo:

```text
backend/storage/audio/
```

e não:

```text
frontend/public/audio/
```

## RN14 — Download autenticado

Download sempre passa pelo backend e pelas regras de autorização.

## RN15 — Reprodução autenticada

O áudio do player também deve ser obtido por endpoint protegido.

## RN16 — Falha da Groq

Se a Groq falhar depois do upload, o sistema deve tratar explicitamente o arquivo armazenado.

Decisão desta especificação:

> Se a transcrição não for concluída e nenhum registro válido for criado, o arquivo temporariamente salvo deve ser removido para evitar arquivo órfão.

## RN17 — Exclusão definitiva

Excluir uma transcrição significa excluir:

- registro;
- arquivo físico correspondente.

## RN18 — Recursos alheios

Recurso inexistente ou pertencente a outro usuário deve retornar `404`, evitando confirmar existência.

---

# 9. Arquitetura geral

```text
┌─────────────────────┐
│     NAVEGADOR       │
│ React + Vite        │
└──────────┬──────────┘
           │ /api
           ▼
┌─────────────────────┐
│       NestJS        │
│                     │
│ Auth                │
│ Users               │
│ Transcriptions      │
│ Audio Storage       │
└───────┬─────┬───────┘
        │     │
        │     └──────────────► Groq / Whisper
        │
        ├────────────────────► storage/audio/
        │
        ▼
┌─────────────────────┐
│     PostgreSQL      │
└─────────────────────┘
```

---

# 10. Tecnologias

## 10.1 Frontend

- React;
- Vite;
- TypeScript;
- `react-router-dom`;
- axios;
- TanStack Query;
- Zustand;
- `react-hook-form`;
- zod;
- Tailwind CSS v4;
- `lucide-react`.

## 10.2 Backend

- NestJS;
- TypeScript;
- TypeORM;
- PostgreSQL;
- `@nestjs/jwt`;
- `@nestjs/passport`;
- `passport-jwt`;
- `bcryptjs`;
- `class-validator`;
- `class-transformer`;
- Multer.

## 10.3 Infraestrutura local

- Docker;
- Docker Compose;
- PostgreSQL 17.

## 10.4 Serviço externo

- Groq;
- modelo Whisper disponível/configurado.

---

# 11. Divisão de responsabilidades

# 11.1 Frontend

Responsável por:

- interface;
- formulários;
- validação imediata para o usuário;
- exibição da política de senha;
- navegação;
- upload;
- player;
- solicitação de download;
- estados visuais;
- sessão local;
- consumo da API.

Não deve:

- definir permissão real;
- definir proprietário;
- possuir segredo;
- acessar banco;
- acessar arquivo por caminho físico;
- chamar a Groq diretamente.

---

# 11.2 Página/componente

Responsável por:

- apresentar os dados;
- capturar ações;
- delegar comunicação a hooks/services;
- renderizar loading, success, empty e error.

Evitar:

- regras de negócio;
- montagem repetida de headers;
- acesso direto a localStorage em várias páginas.

---

# 11.3 `services/api.ts`

Responsável por:

- instância única de axios;
- base relativa `/api`;
- adicionar token;
- tratar `401` globalmente quando apropriado.

---

# 11.4 `authStore`

Responsável por:

- usuário autenticado;
- access token;
- limpar sessão;
- restaurar estado local quando a aplicação abrir.

Não decide se o token é válido no servidor.

---

# 11.5 Controller

Responsável por:

- rota HTTP;
- parâmetros;
- corpo;
- arquivo;
- status HTTP;
- chamar service;
- iniciar streaming/download por dados já autorizados.

Não deve:

- importar `Repository`;
- escrever regra de propriedade;
- executar SQL;
- chamar Groq diretamente.

---

# 11.6 DTO

Responsável por:

- formato aceito;
- validações;
- transformação;
- rejeição de campos proibidos.

---

# 11.7 Guard

Responsável por:

- verificar JWT;
- rejeitar token ausente;
- rejeitar token inválido;
- rejeitar token expirado;
- proteger papel administrativo.

---

# 11.8 Service

Responsável por:

- regras de negócio;
- propriedade;
- transações lógicas;
- acesso aos repositories;
- coordenação entre arquivo, banco e Groq;
- tratamento de falhas esperadas.

---

# 11.9 Storage Service

Recomenda-se um serviço específico, por exemplo:

```text
StorageService
```

Responsável por:

- gerar nome físico;
- determinar diretório seguro;
- salvar arquivo;
- abrir stream;
- localizar arquivo;
- remover arquivo;
- devolver metadados internos necessários.

Não deve decidir se um usuário pode acessar a transcrição. Essa autorização pertence ao domínio de transcrição.

---

# 11.10 Groq/Transcription Provider Service

Responsável por:

- chamar a API externa;
- utilizar chave via configuração;
- enviar o áudio;
- interpretar resposta;
- converter falhas externas em exceções internas controladas.

---

# 11.11 Repository / TypeORM

Responsável por:

- persistência;
- consultas;
- filtros;
- relacionamentos.

---

# 11.12 Banco de dados

Responsável por dados estruturados e relações.

O arquivo binário do áudio **não será armazenado como BLOB no PostgreSQL** nesta versão.

---

# 11.13 Sistema de arquivos

Responsável pela persistência física do áudio.

Deve ser acessado somente pelo backend.

---

# 12. Modelo de dados

## 12.1 User

| Campo | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| id | UUID | sim | PK |
| name | varchar(120) | sim | nome |
| email | varchar(180) | sim | unique |
| passwordHash | varchar | sim | secreto |
| role | enum | sim | user/admin |
| active | boolean | sim | default true |
| createdAt | timestamp | sim | automático |
| updatedAt | timestamp | sim | automático |

### Enum

```text
user
admin
```

---

## 12.2 Transcription

| Campo | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| id | UUID | sim | PK |
| userId | UUID | sim | FK |
| originalFileName | varchar(255) | sim | exibição/download |
| storedFileName | varchar(255) | sim | nome interno |
| mimeType | varchar(100) | sim | tipo validado |
| fileExtension | varchar(20) | sim | extensão normalizada |
| fileSize | bigint | sim | bytes |
| language | varchar(10) | sim | ex. pt |
| text | text | sim | resultado |
| createdAt | timestamp | sim | automático |

### Não retornar ao frontend sem necessidade

`storedFileName` é detalhe interno.

O frontend não precisa saber o caminho físico.

---

# 13. Relacionamento

```text
USER
  1
  │
  │ possui
  │
  N
TRANSCRIPTION
  │
  │ referencia
  ▼
ARQUIVO DE ÁUDIO PRIVADO
```

---

# 14. Armazenamento de áudio

## 14.1 Estrutura sugerida

```text
backend/
└── storage/
    └── audio/
        ├── <uuid>.m4a
        ├── <uuid>.mp3
        └── ...
```

Alternativamente, pode-se separar por usuário:

```text
storage/audio/<userId>/<uuid>.<ext>
```

A escolha deve ser única e consistente.

## 14.2 Segurança do nome

O nome físico deve ser gerado pelo servidor.

Não fazer:

```text
storage/audio/${file.originalname}
```

como única estratégia.

## 14.3 Caminho

Caminhos internos nunca devem aparecer no JSON da API.

## 14.4 Persistência

O diretório deve ser persistente durante o ciclo da aplicação.

Quando futuramente executado em container, será necessário volume persistente. Isso deverá ser tratado na etapa de deploy.

---

# 15. Tratamento de dados de entrada

Toda entrada do cliente é considerada não confiável.

Validar:

- strings;
- e-mails;
- senha;
- IDs;
- parâmetros;
- MIME;
- extensão;
- tamanho;
- campos extras.

## 15.1 ValidationPipe

Configuração desejada:

```text
whitelist: true
forbidNonWhitelisted: true
transform: true
```

## 15.2 E-mail

Normalizar:

```text
trim()
toLowerCase()
```

## 15.3 Nome

Aplicar `trim()`.

## 15.4 Senha

Não aplicar normalizações que alterem o conteúdo digitado.

Validar política.

## 15.5 Arquivo

Não confiar apenas em:

```text
file.originalname
```

nem apenas na extensão.

Validar `mimetype` conforme conjunto permitido.

---

# 16. Segurança

## 16.1 JWT

Token:

- emitido apenas no backend;
- assinado com `JWT_SECRET`;
- validade de 5 minutos;
- enviado pelo frontend em:

```text
Authorization: Bearer <token>
```

## 16.2 Payload

Manter mínimo:

```json
{
  "sub": "user-uuid",
  "role": "user"
}
```

## 16.3 Expiração

Ao expirar:

```text
401 TOKEN_EXPIRED
```

Nenhuma “tolerância” deve aceitar token expirado.

## 16.4 Experiência após expiração

Frontend deve:

1. detectar `401`;
2. limpar sessão;
3. redirecionar;
4. informar:

> Sua sessão expirou por segurança. Entre novamente para continuar.

## 16.5 Senha

- hash com `bcryptjs`;
- nunca logar;
- nunca retornar;
- nunca persistir em texto.

## 16.6 Groq

`GROQ_API_KEY` fica somente no `.env` do backend.

## 16.7 Controle horizontal

Para obter transcrição:

```text
id = :id
AND userId = :currentUser.id
```

ou estratégia equivalente que garanta propriedade.

## 16.8 Áudio

Não expor:

```text
/storage/audio/arquivo.mp3
```

como URL pública direta.

A reprodução e o download passam por controller protegido.

## 16.9 Directory traversal

Nenhum caminho deve ser montado a partir de valor bruto fornecido pelo usuário.

## 16.10 Logs

Não registrar:

- senha;
- passwordHash;
- token completo;
- chaves;
- conteúdo binário.

---

# 17. Contrato padrão da API

## 17.1 Sucesso com conteúdo

```json
{
  "data": {}
}
```

## 17.2 Lista

```json
{
  "data": [],
  "meta": {}
}
```

## 17.3 Erro

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Confira os dados informados.",
  "details": []
}
```

---

# 18. Endpoints — autenticação

## POST `/api/auth/register`

### Request

```json
{
  "name": "Ana Souza",
  "email": "ana@email.com",
  "password": "Ditado@2026"
}
```

### 201

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "name": "Ana Souza",
      "email": "ana@email.com",
      "role": "user",
      "active": true
    }
  }
}
```

### 400 — senha fraca

```json
{
  "statusCode": 400,
  "code": "WEAK_PASSWORD",
  "message": "A senha não atende aos requisitos de segurança.",
  "details": [
    {
      "field": "password",
      "message": "Use no mínimo 8 caracteres, incluindo letra, número e caractere especial."
    }
  ]
}
```

### Frontend

Apresentar:

> Use no mínimo 8 caracteres, incluindo letra, número e caractere especial.

### 409

```json
{
  "statusCode": 409,
  "code": "EMAIL_ALREADY_EXISTS",
  "message": "Já existe uma conta cadastrada com este e-mail."
}
```

---

## POST `/api/auth/login`

### Request

```json
{
  "email": "ana@email.com",
  "password": "Ditado@2026"
}
```

### 200

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "name": "Ana Souza",
      "email": "ana@email.com",
      "role": "user"
    },
    "accessToken": "<jwt>",
    "expiresIn": 300
  }
}
```

`300` representa 5 minutos em segundos.

### 401

```json
{
  "statusCode": 401,
  "code": "INVALID_CREDENTIALS",
  "message": "E-mail ou senha inválidos."
}
```

### 403

```json
{
  "statusCode": 403,
  "code": "ACCOUNT_INACTIVE",
  "message": "Esta conta está desativada."
}
```

---

## GET `/api/auth/me`

Protegida.

### 200

Retorna usuário público.

### 401 token expirado

```json
{
  "statusCode": 401,
  "code": "TOKEN_EXPIRED",
  "message": "Sua sessão expirou."
}
```

---

# 19. Endpoints — transcrições

## POST `/api/transcriptions`

**Autenticação:** obrigatória  
**Content-Type:** `multipart/form-data`

Campos:

```text
file
language
```

### Fluxo obrigatório

1. Guard valida JWT.
2. Controller recebe upload.
3. Backend valida tipo e tamanho.
4. StorageService gera nome interno.
5. Arquivo é armazenado.
6. Service envia arquivo à Groq.
7. Groq retorna texto.
8. Registro é persistido.
9. API retorna transcrição.
10. Query de histórico pode ser invalidada no frontend.

### 201

```json
{
  "data": {
    "id": "uuid",
    "originalFileName": "reuniao.m4a",
    "mimeType": "audio/mp4",
    "fileSize": 1784552,
    "language": "pt",
    "text": "Texto transcrito...",
    "createdAt": "2026-10-04T20:00:00Z",
    "audio": {
      "streamUrl": "/api/transcriptions/uuid/audio",
      "downloadUrl": "/api/transcriptions/uuid/audio/download"
    }
  }
}
```

As URLs são lógicas. Não expõem localização física.

### 400 — sem arquivo

```json
{
  "statusCode": 400,
  "code": "FILE_REQUIRED",
  "message": "Selecione um arquivo de áudio."
}
```

### 400 — tipo inválido

```json
{
  "statusCode": 400,
  "code": "INVALID_AUDIO_TYPE",
  "message": "Formato de áudio não suportado."
}
```

### 413

```json
{
  "statusCode": 413,
  "code": "FILE_TOO_LARGE",
  "message": "O arquivo ultrapassa o limite de 25 MB."
}
```

### 502

```json
{
  "statusCode": 502,
  "code": "TRANSCRIPTION_PROVIDER_ERROR",
  "message": "Não foi possível transcrever o áudio neste momento."
}
```

### Regra de compensação

Se o arquivo tiver sido salvo, mas a transcrição falhar antes da persistência válida:

```text
remover arquivo salvo
→ não criar registro
→ retornar erro
```

---

## GET `/api/transcriptions`

Somente do usuário autenticado.

### 200

```json
{
  "data": [
    {
      "id": "uuid",
      "originalFileName": "reuniao.m4a",
      "fileSize": 1784552,
      "language": "pt",
      "textPreview": "Trecho inicial...",
      "createdAt": "2026-10-04T20:00:00Z"
    }
  ]
}
```

### Lista vazia

```json
{
  "data": []
}
```

Mensagem:

> Você ainda não possui transcrições.

---

## GET `/api/transcriptions/:id`

### 200

```json
{
  "data": {
    "id": "uuid",
    "originalFileName": "reuniao.m4a",
    "mimeType": "audio/mp4",
    "fileSize": 1784552,
    "language": "pt",
    "text": "Texto completo...",
    "createdAt": "2026-10-04T20:00:00Z",
    "audio": {
      "streamUrl": "/api/transcriptions/uuid/audio",
      "downloadUrl": "/api/transcriptions/uuid/audio/download"
    }
  }
}
```

### 404

```json
{
  "statusCode": 404,
  "code": "TRANSCRIPTION_NOT_FOUND",
  "message": "Transcrição não encontrada."
}
```

---

# 20. Endpoint de reprodução

## GET `/api/transcriptions/:id/audio`

Objetivo:

- fornecer o arquivo para reprodução;
- permitir uso em `<audio>`;
- exigir autenticação;
- verificar propriedade.

### Resposta

Headers apropriados:

```text
Content-Type: <mimeType real armazenado>
Accept-Ranges: bytes
Content-Length: ...
```

### Range

Sempre que viável, deve ser suportado `Range` HTTP para permitir:

- avançar;
- retroceder;
- carregar partes;
- melhor experiência do player.

Nesse caso, a resposta parcial utiliza:

```text
206 Partial Content
```

### 404

Se não existir ou não pertencer ao usuário:

```json
{
  "statusCode": 404,
  "code": "AUDIO_NOT_FOUND",
  "message": "Áudio não encontrado."
}
```

---

# 21. Endpoint de download

## GET `/api/transcriptions/:id/audio/download`

### Objetivo

Baixar o arquivo original associado à transcrição.

### Segurança

Antes de abrir o arquivo:

1. validar JWT;
2. buscar transcrição com propriedade;
3. confirmar existência física;
4. iniciar download.

### Headers

```text
Content-Type: <mimeType>
Content-Disposition: attachment; filename="<nome-seguro>"
```

O nome apresentado deverá se basear no nome original, tratado adequadamente para header HTTP.

### 404

Mesmo princípio de não revelar recursos de terceiros.

---

# 22. Exclusão

## DELETE `/api/transcriptions/:id`

### Fluxo

1. validar JWT;
2. localizar por `id + owner`;
3. obter referência interna do arquivo;
4. remover arquivo;
5. remover registro;
6. retornar 204.

### Tratamento de inconsistência

Se o registro existir e o arquivo físico já não existir:

- registrar erro técnico;
- permitir que o registro seja removido de forma controlada;
- não expor caminho ao cliente.

### 204

Sem corpo.

Frontend:

> Transcrição e áudio excluídos com sucesso.

---

# 23. Administração

## GET `/api/users`

Somente `admin`.

Nunca retornar:

```text
passwordHash
```

## PATCH `/api/users/:id`

Escopo da versão:

```json
{
  "active": false
}
```

Mudança de `role` permanece fora do MVP.

---

# 24. Tratamento de respostas para o usuário

| Situação | HTTP | Código | Mensagem apresentada |
|---|---:|---|---|
| cadastro realizado | 201 | — | Conta criada com sucesso. |
| senha fraca | 400 | WEAK_PASSWORD | Use no mínimo 8 caracteres, incluindo letra, número e caractere especial. |
| dados inválidos | 400 | VALIDATION_ERROR | Confira os campos informados. |
| arquivo ausente | 400 | FILE_REQUIRED | Selecione um arquivo de áudio. |
| formato inválido | 400 | INVALID_AUDIO_TYPE | O formato escolhido não é suportado. |
| login inválido | 401 | INVALID_CREDENTIALS | E-mail ou senha inválidos. |
| token expirado | 401 | TOKEN_EXPIRED | Sua sessão expirou por segurança. Entre novamente. |
| sem permissão | 403 | FORBIDDEN | Você não possui permissão para acessar esta área. |
| conta inativa | 403 | ACCOUNT_INACTIVE | Sua conta está desativada. |
| transcrição inexistente | 404 | TRANSCRIPTION_NOT_FOUND | Transcrição não encontrada. |
| áudio inexistente | 404 | AUDIO_NOT_FOUND | Áudio não encontrado. |
| e-mail duplicado | 409 | EMAIL_ALREADY_EXISTS | Este e-mail já está cadastrado. |
| arquivo >25 MB | 413 | FILE_TOO_LARGE | O arquivo ultrapassa o limite de 25 MB. |
| Groq indisponível | 502 | TRANSCRIPTION_PROVIDER_ERROR | Não foi possível transcrever o áudio agora. Tente novamente. |
| erro inesperado | 500 | INTERNAL_ERROR | Ocorreu um erro inesperado. Tente novamente. |

---

# 25. Estados de interface

## 25.1 Upload

### Idle

> Selecione um arquivo para começar.

### Selected

Mostrar:

- nome;
- tamanho;
- formato.

### Uploading/Transcribing

> Enviando e transcrevendo seu áudio...

Botão fica desabilitado para evitar duplicidade.

### Success

> Transcrição concluída.

Exibir player + texto + download.

### Error

Exibir mensagem tratada.

---

# 26. Telas

## 26.1 Landing

Rota:

```text
/
```

## 26.2 Cadastro

Rota:

```text
/cadastro
```

### Elementos adicionais

Checklist visual de senha:

```text
[ ] 8 ou mais caracteres
[ ] contém letra
[ ] contém número
[ ] contém caractere especial
```

Cada item muda conforme digitação.

## 26.3 Login

Rota:

```text
/entrar
```

## 26.4 Nova transcrição

Rota:

```text
/app
```

Após sucesso:

```text
Nome: reuniao.m4a

[ ▶ Player de áudio ]

Transcrição:
--------------------------------
texto...
--------------------------------

[ Baixar áudio ]
[ Copiar texto ]
[ Ver histórico ]
```

## 26.5 Histórico

Rota:

```text
/app/historico
```

Cada item:

- arquivo;
- data;
- tamanho;
- prévia;
- visualizar;
- excluir.

## 26.6 Detalhe

Rota:

```text
/app/transcricoes/:id
```

Elementos:

- nome;
- data;
- tamanho;
- idioma;
- player;
- texto;
- botão baixar;
- botão excluir.

A disposição deve facilitar ouvir e conferir o texto.

## 26.7 Administração

Rota:

```text
/app/admin/usuarios
```

---

# 27. Axios e autenticação

## Interceptor de request

Enviar:

```text
Authorization: Bearer <token>
```

## Interceptor de response

Ao receber `401` por expiração:

1. limpar `authStore`;
2. remover token persistido;
3. redirecionar para `/entrar`;
4. preservar uma indicação de motivo;
5. exibir:

> Sua sessão expirou por segurança. Entre novamente.

### Observação sobre player de áudio

Como `<audio src="...">` não permite adicionar facilmente o Bearer token por header em todas as abordagens, a implementação deve escolher uma estratégia segura.

Opções aceitáveis:

**A.** buscar o áudio por Axios/fetch autenticado, gerar `Blob URL` temporária e atribuí-la ao player;

ou

**B.** outra estratégia autenticada equivalente que não torne o arquivo público e não coloque JWT permanente na URL.

Não é aceitável transformar o diretório de áudio em pasta pública apenas para facilitar o player.

---

# 28. Variáveis de ambiente

```text
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=ditado
DATABASE_PASSWORD=
DATABASE_NAME=ditado

JWT_SECRET=
JWT_EXPIRES_IN=5m

GROQ_API_KEY=
GROQ_TRANSCRIPTION_MODEL=whisper-large-v3-turbo

AUDIO_STORAGE_PATH=./storage/audio
MAX_AUDIO_SIZE_MB=25
```

---

# 29. Plano de desenvolvimento detalhado

A implementação deverá ocorrer por etapas independentes.

Cada etapa só deve ser considerada encerrada quando **todos** os critérios de aceite forem verificados.

---

## ETAPA 0 — Preparação e artefatos

### Objetivo

Garantir que decisões essenciais existam antes do código.

### Entregas

- `docs/ESPECIFICACAO.md`;
- `AGENTS.md`;
- `.gitignore`;
- `.env.example`;
- estrutura inicial do repositório.

### Motivo

Sem contratos prévios, o código tende a assumir regras diferentes em cada camada.

### Critérios de aceite

- [ ] `ESPECIFICACAO.md` está no repositório;
- [ ] `AGENTS.md` existe;
- [ ] `.env.example` contém nomes, mas nenhum segredo real;
- [ ] `.gitignore` contém `.env`;
- [ ] `.gitignore` contém diretórios/arquivos locais necessários;
- [ ] nenhum segredo está versionado;
- [ ] política de senha está documentada;
- [ ] validade JWT de 5 minutos está documentada;
- [ ] armazenamento do áudio está documentado;
- [ ] endpoints de reprodução/download estão documentados.

---

## ETAPA 1 — Infraestrutura e skeleton

### Objetivo

Subir frontend, backend e banco com o mínimo de domínio.

### Entregas

- React/Vite;
- NestJS;
- PostgreSQL;
- Docker Compose;
- health check;
- proxy `/api`.

### Motivo

Todas as etapas posteriores dependem de comunicação estável entre os componentes.

### Critérios de aceite

- [ ] `docker compose up -d` sobe PostgreSQL;
- [ ] banco responde;
- [ ] backend inicia sem erro;
- [ ] frontend inicia sem erro;
- [ ] `GET /api/health` retorna 200;
- [ ] frontend consegue chamar `/api/health`;
- [ ] frontend não utiliza URL absoluta fixa para backend;
- [ ] backend lê configuração de `.env`;
- [ ] nenhum `.env` está no Git.

---

## ETAPA 2 — Modelo User e validação de cadastro

### Objetivo

Criar cadastro seguro.

### Entregas

- User entity;
- repository/service/controller;
- DTO;
- hash;
- política de senha;
- formulário frontend.

### Motivo

Usuário é a base de propriedade das transcrições.

### Critérios de aceite — backend

- [ ] nome ausente retorna 400;
- [ ] e-mail inválido retorna 400;
- [ ] e-mail é normalizado;
- [ ] e-mail duplicado retorna 409;
- [ ] senha com menos de 8 retorna 400;
- [ ] senha sem letra retorna 400;
- [ ] senha sem número retorna 400;
- [ ] senha sem especial retorna 400;
- [ ] senha válida é aceita;
- [ ] `role` enviado no cadastro é rejeitado;
- [ ] `active` enviado no cadastro é rejeitado;
- [ ] `role` persistido é `user`;
- [ ] `active` persistido é `true`;
- [ ] banco contém hash, não senha;
- [ ] `passwordHash` não aparece no JSON.

### Critérios de aceite — frontend

- [ ] critérios aparecem visualmente;
- [ ] cada critério reage à digitação;
- [ ] senha inválida impede envio;
- [ ] confirmação diferente impede envio;
- [ ] senha válida libera formulário;
- [ ] erro 409 aparece de forma legível;
- [ ] frontend nunca envia `role`.

---

## ETAPA 3 — Login, JWT e expiração em 5 minutos

### Objetivo

Criar autenticação curta e previsível.

### Entregas

- login;
- bcrypt compare;
- JWT strategy;
- guard;
- authStore;
- axios interceptor;
- rota protegida.

### Motivo

A aplicação contém áudio privado e histórico pessoal, portanto toda rota interna precisa de identidade confiável.

### Critérios de aceite

- [ ] login correto retorna 200;
- [ ] login incorreto retorna 401;
- [ ] mensagem não informa se o e-mail existe;
- [ ] conta inativa retorna 403;
- [ ] token contém `sub`;
- [ ] token contém `role`;
- [ ] token possui expiração aproximada de 300 segundos;
- [ ] rota sem token retorna 401;
- [ ] rota com token adulterado retorna 401;
- [ ] rota com token expirado retorna 401;
- [ ] após 5 minutos, uma nova chamada protegida não é aceita;
- [ ] frontend trata 401 de token expirado;
- [ ] sessão local é limpa;
- [ ] usuário é redirecionado;
- [ ] mensagem de expiração é apresentada;
- [ ] nenhuma renovação silenciosa ocorre;
- [ ] logout limpa sessão.

### Teste manual obrigatório

1. login;
2. confirmar acesso a `/app`;
3. aguardar expiração;
4. realizar chamada privada;
5. confirmar 401;
6. confirmar redirecionamento para login.

---

## ETAPA 4 — Storage privado de áudio

### Objetivo

Salvar arquivos com segurança antes de integrar transcrição.

### Entregas

- `StorageService`;
- diretório privado;
- geração de nome interno;
- validação de formatos;
- limite 25 MB.

### Motivo

O áudio passará a ser dado persistente e privado.

### Critérios de aceite

- [ ] upload sem arquivo retorna 400;
- [ ] extensão não permitida retorna 400;
- [ ] MIME não permitido retorna 400;
- [ ] arquivo >25 MB retorna 413;
- [ ] arquivo válido é salvo;
- [ ] nome físico é gerado pelo servidor;
- [ ] nome original não controla caminho;
- [ ] caminho físico não aparece no retorno;
- [ ] arquivo não fica acessível por URL pública;
- [ ] usuário não consegue escolher diretório;
- [ ] tentativas com nomes contendo `../` não geram fuga de diretório;
- [ ] diretório é criado/configurado corretamente.

---

## ETAPA 5 — Integração com Groq e persistência

### Objetivo

Transformar áudio salvo em uma transcrição persistente.

### Entregas

- provider Groq;
- Transcription entity;
- service;
- criação do registro;
- compensação em erro.

### Motivo

Essa é a funcionalidade central do produto.

### Critérios de aceite

- [ ] áudio válido é enviado à Groq;
- [ ] chave está somente no backend;
- [ ] retorno textual é armazenado;
- [ ] transcrição é associada ao `sub` do token;
- [ ] cliente não envia `userId` como proprietário;
- [ ] nome original é persistido;
- [ ] storedFileName é persistido internamente;
- [ ] tamanho e MIME são persistidos;
- [ ] sucesso retorna 201;
- [ ] erro da Groq retorna 502 tratado;
- [ ] erro bruto do provedor não vai ao frontend;
- [ ] se Groq falhar, arquivo provisório é removido;
- [ ] se persistência falhar após salvar arquivo, o arquivo não fica órfão;
- [ ] stack trace não vai ao frontend.

---

## ETAPA 6 — Histórico e detalhe

### Objetivo

Permitir acesso posterior ao conteúdo.

### Entregas

- listagem;
- detalhe;
- preview;
- ordenação.

### Critérios de aceite

- [ ] histórico exige JWT;
- [ ] lista contém apenas registros do usuário;
- [ ] lista ordena mais recentes primeiro;
- [ ] lista vazia retorna `[]`;
- [ ] tela vazia possui mensagem amigável;
- [ ] detalhe próprio retorna 200;
- [ ] detalhe de terceiro retorna 404;
- [ ] UUID inexistente retorna 404;
- [ ] `storedFileName` não é exposto desnecessariamente;
- [ ] texto completo aparece no detalhe.

---

## ETAPA 7 — Reprodução segura do áudio

### Objetivo

Permitir que o usuário ouça o arquivo e confira a transcrição.

### Entregas

- endpoint de streaming;
- player;
- autenticação;
- propriedade;
- tratamento de MIME;
- suporte adequado ao carregamento.

### Motivo

A comparação áudio/texto é necessária para o usuário validar a qualidade da transcrição.

### Critérios de aceite

- [ ] usuário reproduz áudio próprio;
- [ ] áudio de terceiro não é reproduzido;
- [ ] sem token não há acesso;
- [ ] arquivo inexistente retorna 404;
- [ ] MIME correto é devolvido;
- [ ] player possui play/pause;
- [ ] usuário consegue movimentar a posição quando o formato/browser permitir;
- [ ] backend não expõe diretório;
- [ ] token não é colocado permanentemente em URL pública;
- [ ] estratégia do player mantém autenticação;
- [ ] texto e player ficam disponíveis na mesma tela ou de forma simples de comparar;
- [ ] erros de reprodução são tratados visualmente.

### Critério recomendado

- [ ] suporte a `Range` devolve `206 Partial Content` quando requisitado.

---

## ETAPA 8 — Download autenticado

### Objetivo

Permitir recuperação do áudio original.

### Entregas

- endpoint de download;
- botão;
- headers.

### Motivo

O usuário deve conservar acesso ao arquivo que originou a transcrição.

### Critérios de aceite

- [ ] botão existe no detalhe;
- [ ] download exige autenticação;
- [ ] download próprio funciona;
- [ ] download de terceiro retorna 404;
- [ ] `Content-Disposition` usa attachment;
- [ ] arquivo baixado possui conteúdo íntegro;
- [ ] nome apresentado é derivado do nome original de forma segura;
- [ ] caminho interno nunca é exibido;
- [ ] token expirado durante nova tentativa exige novo login.

---

## ETAPA 9 — Exclusão consistente

### Objetivo

Excluir texto e arquivo sem deixar resíduos.

### Entregas

- DELETE;
- remoção de arquivo;
- atualização de histórico.

### Motivo

Agora existem dois recursos persistentes: linha no banco e arquivo.

### Critérios de aceite

- [ ] exclusão própria retorna 204;
- [ ] exclusão de terceiro retorna 404;
- [ ] arquivo físico é removido;
- [ ] registro é removido;
- [ ] histórico é atualizado;
- [ ] item deixa de abrir;
- [ ] download deixa de funcionar;
- [ ] reprodução deixa de funcionar;
- [ ] falha de arquivo ausente é tratada;
- [ ] detalhes internos da falha não aparecem para usuário.

---

## ETAPA 10 — Administração

### Objetivo

Permitir gestão de contas.

### Entregas

- Users admin controller;
- roles guard;
- listagem;
- alteração de `active`.

### Critérios de aceite

- [ ] admin lista usuários;
- [ ] user recebe 403;
- [ ] resposta não contém passwordHash;
- [ ] admin desativa usuário;
- [ ] usuário desativado não faz novo login;
- [ ] admin reativa usuário;
- [ ] usuário reativado volta a poder autenticar;
- [ ] PATCH rejeita campos fora do contrato;
- [ ] mudança de role não ocorre por esse endpoint nesta versão.

---

## ETAPA 11 — Landing page e acabamento UX

### Objetivo

Finalizar experiência ponta a ponta.

### Entregas

- landing;
- mensagens;
- loading;
- empty;
- responsividade;
- confirmação de exclusão.

### Critérios de aceite

- [ ] visitante entende a função do produto;
- [ ] cadastro é acessível;
- [ ] política de senha é clara;
- [ ] login é acessível;
- [ ] usuário vê feedback durante transcrição;
- [ ] botão não dispara múltiplos uploads acidentais;
- [ ] erros são compreensíveis;
- [ ] histórico vazio é tratado;
- [ ] player é utilizável;
- [ ] download é evidente;
- [ ] exclusão pede confirmação;
- [ ] telas principais funcionam em largura móvel e desktop.

---

## ETAPA 12 — Revisão de segurança

### Objetivo

Revisar falhas que podem existir mesmo quando a aplicação aparentemente funciona.

### Critérios de aceite

- [ ] passwordHash nunca sai;
- [ ] cadastro não aceita role;
- [ ] cadastro não aceita active;
- [ ] JWT expira em 5 min;
- [ ] token expirado é rejeitado;
- [ ] `.env` não está versionado;
- [ ] frontend não contém segredo;
- [ ] Groq não é chamada pelo browser;
- [ ] áudio não está em pasta pública;
- [ ] download verifica proprietário;
- [ ] streaming verifica proprietário;
- [ ] detalhe verifica proprietário;
- [ ] exclusão verifica proprietário;
- [ ] user não acessa admin;
- [ ] controller não importa Repository;
- [ ] originalFileName não é caminho;
- [ ] erros não retornam stack;
- [ ] logs não contêm segredo;
- [ ] arquivos >25 MB são rejeitados;
- [ ] MIME inválido é rejeitado;
- [ ] campos extras em DTO são tratados.

---

## ETAPA 13 — Teste integrado final

### Fluxo A — usuário novo

```text
Landing
→ Cadastro com senha forte
→ Login
→ Upload
→ Transcrição
→ Reprodução
→ Conferência do texto
→ Download
→ Histórico
→ Detalhe
→ Exclusão
→ Logout
```

### Critérios

- [ ] fluxo completo sem erro;
- [ ] arquivo baixado corresponde ao enviado;
- [ ] áudio reproduzido corresponde ao enviado;
- [ ] texto permanece após recarregar;
- [ ] histórico permanece após recarregar.

### Fluxo B — token expirado

```text
Login
→ aguardar >5 min
→ acessar/requisitar recurso
→ 401
→ limpeza da sessão
→ login
```

- [ ] comportamento completo confirmado.

### Fluxo C — isolamento

Com usuários A e B:

- [ ] A cria transcrição;
- [ ] B não abre detalhe de A;
- [ ] B não reproduz áudio de A;
- [ ] B não baixa áudio de A;
- [ ] B não exclui transcrição de A.

### Fluxo D — administrador

- [ ] user comum recebe 403;
- [ ] admin lista contas;
- [ ] admin desativa conta;
- [ ] conta desativada não faz login.

---

# 30. Critérios globais de aceite

A aplicação completa só será aceita quando:

- [ ] cadastro possui validação frontend e backend;
- [ ] política de senha está aplicada integralmente;
- [ ] JWT dura 5 minutos;
- [ ] token expirado é rejeitado;
- [ ] sessão expirada é tratada;
- [ ] áudio é armazenado no backend;
- [ ] áudio é privado;
- [ ] áudio pode ser reproduzido pelo proprietário;
- [ ] áudio pode ser baixado pelo proprietário;
- [ ] áudio não pode ser reproduzido/baixado por terceiro;
- [ ] transcrição é persistida;
- [ ] histórico é individual;
- [ ] exclusão remove banco + arquivo;
- [ ] Groq fica no backend;
- [ ] `passwordHash` nunca é retornado;
- [ ] mensagens técnicas são tratadas;
- [ ] responsabilidades estão separadas;
- [ ] todos os fluxos críticos foram verificados manualmente.

---

# 31. Definição de pronto (Definition of Done)

Uma etapa só está pronta quando:

1. implementação está concluída;
2. contrato da API está respeitado;
3. critérios de aceite passaram;
4. cenários de erro foram verificados;
5. controle de acesso foi verificado;
6. mensagens ao usuário foram conferidas;
7. dados sensíveis não foram expostos;
8. alterações relevantes foram refletidas nesta especificação;
9. código está organizado de acordo com as responsabilidades;
10. resultado foi verificado no terminal/navegador pelo grupo.

---

# 32. Decisões consolidadas desta versão

1. JWT expira a cada 5 minutos.
2. Não há refresh token no MVP.
3. Após expiração, usuário precisa autenticar-se novamente.
4. Senha exige 8+ caracteres, letra, número e especial.
5. Política de senha é validada tanto no frontend quanto no backend.
6. Áudio é armazenado persistentemente pelo backend.
7. Arquivo físico usa nome interno gerado pelo servidor.
8. Nome original é preservado como metadado.
9. Áudio não fica em diretório público.
10. Reprodução exige autenticação e propriedade.
11. Download exige autenticação e propriedade.
12. Tela de detalhe reúne texto e player para conferência.
13. Em exclusão, banco e arquivo devem ser removidos.
14. Falha na transcrição não deve deixar arquivo órfão.
15. PostgreSQL armazena metadados e texto; o áudio fica no sistema de arquivos.
16. Mudança de role não faz parte do MVP.
17. Recurso alheio é tratado como 404.
18. A especificação deve ser atualizada antes de qualquer mudança relevante de comportamento.
