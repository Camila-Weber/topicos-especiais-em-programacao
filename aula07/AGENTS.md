# AGENTS.md — Ditado

> **Projeto:** Ditado  
> **Tipo:** Aplicação web full stack para transcrição de áudio  
> **Finalidade deste arquivo:** definir como agentes de IA, assistentes de código e desenvolvedores devem analisar, alterar, testar e documentar este repositório.  
> **Documentos normativos:** `docs/ESPECIFICACAO.md` e `PLANO_DE_ACAO.md`.

---

# 1. Objetivo deste documento

Este arquivo é o contrato operacional do repositório.

Qualquer agente que crie, altere, revise, teste ou proponha código para o Ditado deve obedecer a estas instruções antes de executar mudanças.

O objetivo é impedir que implementações localmente convenientes violem:

- requisitos funcionais;
- regras de negócio;
- contratos HTTP;
- segurança e privacidade;
- separação de responsabilidades;
- decisões arquiteturais;
- critérios de aceite;
- sequência controlada do plano de ação.

Este arquivo não substitui a especificação nem o plano. Ele determina **como trabalhar a partir deles**.

---

# 2. Fontes de verdade e prioridade

Antes de alterar comportamento do sistema, consultar obrigatoriamente:

1. `docs/ESPECIFICACAO.md` — fonte de verdade para requisitos, regras, arquitetura, segurança, contratos, endpoints, mensagens e critérios de aceite;
2. `PLANO_DE_ACAO.md` — fonte de verdade para ordem de execução, estado atual, itens concluídos, pendências e validações realizadas;
3. código e testes existentes — implementação atual, desde que não contradigam os documentos acima;
4. este `AGENTS.md` — regras operacionais para executar o trabalho.

Em caso de conflito:

- requisito explícito da especificação prevalece sobre conveniência de implementação;
- o plano indica o que já foi executado e o que continua pendente;
- código existente não transforma comportamento divergente em requisito válido;
- nenhuma alteração relevante de comportamento deve ser feita silenciosamente.

Se uma solicitação exigir mudança de requisito, contrato, segurança, arquitetura ou fluxo:

1. identificar a divergência;
2. explicar o impacto;
3. atualizar primeiro a documentação correspondente;
4. somente depois implementar a mudança aprovada.

Não inventar requisitos ausentes.

---

# 3. Regra obrigatória de execução por etapas

O trabalho deve respeitar o `PLANO_DE_ACAO.md`.

## 3.1 Não avançar automaticamente

Uma etapa deve ser tratada isoladamente quando o trabalho solicitado estiver organizado por etapas.

Ao concluir uma etapa, o agente deve:

1. informar objetivamente o que foi alterado;
2. listar arquivos relevantes criados/modificados;
3. informar testes/comandos executados;
4. confrontar o resultado com os critérios de aceite da etapa;
5. apontar critérios não validados ou pendências;
6. indicar riscos conhecidos;
7. **perguntar explicitamente se pode avançar para a próxima etapa**.

O agente não deve começar a próxima etapa sem autorização explícita do usuário.

## 3.2 Critério pendente bloqueia conclusão

Não marcar uma etapa como concluída quando existir critério obrigatório não atendido.

Usar classificações claras:

- `ATENDIDO` — verificado objetivamente;
- `PENDENTE` — ainda não executado/verificado;
- `BLOQUEADO` — depende de recurso externo, segredo, decisão ou ambiente indisponível;
- `FALHOU` — verificação executada com resultado incompatível com o critério.

Não converter `PENDENTE`, `BLOQUEADO` ou `FALHOU` em sucesso apenas porque build ou testes parciais passaram.

## 3.3 Não reexecutar trabalho concluído sem motivo

Antes de implementar, verificar no plano se a funcionalidade já está marcada como concluída.

Se estiver concluída:

- não recriar módulos desnecessariamente;
- preservar contratos existentes;
- executar somente a alteração solicitada;
- rodar regressão proporcional ao impacto.

---

# 4. Estado conhecido do projeto

O projeto já possui grande parte do MVP implementada e validada.

O agente deve tratar o repositório como projeto existente, não como greenfield.

Conforme o plano atual, estão implementados, entre outros:

- estrutura frontend/backend/banco;
- landing page;
- cadastro;
- autenticação;
- JWT;
- sessão e logout;
- armazenamento privado;
- upload;
- integração estrutural com Groq;
- histórico;
- detalhe;
- reprodução autenticada;
- download autenticado;
- exclusão;
- administração;
- controles de segurança;
- testes HTTP integrados.

Pendências registradas devem continuar visíveis até validação real. Em especial:

- transcrição real bem-sucedida pela Groq depende de `GROQ_API_KEY` válida;
- validação visual manual da evolução da landing page está pendente no plano atual.

Nunca declarar essas pendências resolvidas sem evidência.

---

# 5. Escopo do MVP

O Ditado permite:

- visitante conhecer o produto;
- criar conta;
- autenticar-se;
- enviar um arquivo de áudio;
- transcrever o áudio;
- armazenar áudio e texto;
- consultar histórico pessoal;
- abrir detalhes;
- reproduzir o próprio áudio;
- baixar o próprio áudio;
- comparar áudio e transcrição;
- excluir transcrição e arquivo;
- administrador listar e ativar/desativar contas.

Não adicionar ao MVP sem alteração explícita da especificação:

- refresh token;
- recuperação de senha por e-mail;
- autenticação social;
- pagamentos ou assinaturas;
- compartilhamento público;
- compartilhamento entre usuários;
- transcrição em tempo real;
- edição colaborativa;
- resumo por IA;
- identificação automática de falantes;
- tradução automática;
- exportação PDF/DOCX;
- painel analítico;
- upload simultâneo de vários arquivos;
- S3 ou armazenamento externo equivalente;
- alteração de `role` pela API administrativa atual.

Evitar scope creep.

---

# 6. Stack obrigatória e arquitetura

## 6.1 Frontend

Tecnologias previstas:

- React;
- Vite;
- TypeScript;
- `react-router-dom`;
- Axios;
- TanStack Query;
- Zustand;
- `react-hook-form`;
- Zod;
- Tailwind CSS v4;
- `lucide-react`.

## 6.2 Backend

Tecnologias previstas:

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

## 6.3 Infraestrutura

- Docker;
- Docker Compose;
- PostgreSQL 17;
- armazenamento local privado de áudio no backend.

## 6.4 Serviço externo

A transcrição deve ser executada pelo backend usando Groq/Whisper configurado.

O navegador nunca deve possuir nem utilizar `GROQ_API_KEY`.

---

# 7. Princípios arquiteturais obrigatórios

## 7.1 Separação de responsabilidades

Preservar camadas e módulos.

Não concentrar regras de negócio em componentes React ou Controllers NestJS.

### Frontend

Responsável por:

- interface;
- formulários;
- feedback imediato;
- navegação;
- estado visual;
- sessão local;
- consumo da API;
- player e download por fluxo autenticado.

Não é autoridade de segurança.

### Componentes/páginas

Devem:

- renderizar dados;
- capturar ações;
- delegar acesso remoto a hooks/services;
- representar `idle`, `loading`, `success`, `empty` e `error`.

Evitar lógica de domínio e headers HTTP repetidos em páginas.

### `services/api.ts`

Centraliza:

- instância Axios;
- base `/api`;
- token de autenticação;
- tratamento global adequado de `401`.

### `authStore`

Gerencia:

- usuário autenticado;
- access token;
- restauração local;
- limpeza da sessão.

O store não substitui validação do token pelo servidor.

### Controller

Pode:

- declarar rotas;
- receber parâmetros/body/arquivo;
- selecionar status HTTP;
- chamar Services;
- iniciar stream/download após autorização do domínio.

Não deve:

- importar Repository diretamente;
- executar SQL;
- implementar propriedade de recurso;
- chamar Groq diretamente;
- conter regra de negócio substancial.

### DTO

Responsável por:

- contrato de entrada;
- validação;
- transformação;
- rejeição de campos não permitidos.

### Guards

Responsáveis por:

- autenticação JWT;
- token ausente/inválido/expirado;
- proteção de papel administrativo.

### Services de domínio

Responsáveis por:

- regras de negócio;
- propriedade;
- coordenação de persistência;
- integração entre banco, storage e provider;
- compensação e tratamento de falhas esperadas.

### `StorageService`

Responsável por:

- nome físico seguro;
- diretório privado;
- salvar;
- localizar;
- abrir stream;
- remover;
- metadados internos.

Não decide autorização do usuário.

### Provider de transcrição

Responsável por:

- integração Groq;
- uso da chave do ambiente;
- envio do áudio;
- interpretação da resposta;
- tradução de erro externo para erro interno controlado.

### Repository/TypeORM

Responsável por persistência, consultas, filtros e relacionamentos.

---

# 8. Regras de autenticação e sessão

Estas regras são invariantes do MVP:

- autenticação por e-mail e senha;
- JWT emitido somente pelo backend;
- JWT expira em **5 minutos**;
- `JWT_EXPIRES_IN=5m`;
- payload mínimo com `sub` e `role`;
- não existe refresh token;
- não existe renovação silenciosa;
- token expirado deve ser rejeitado;
- após expiração, nova operação protegida retorna `401`;
- frontend limpa a sessão;
- frontend redireciona para `/entrar`;
- usuário deve autenticar-se novamente.

Não aumentar a duração do token para facilitar desenvolvimento/teste.

Não implementar refresh token sem mudança explícita de requisito.

O logout remove token e dados locais da sessão.

---

# 9. Política de senha

A senha deve possuir simultaneamente:

- no mínimo 8 caracteres;
- pelo menos uma letra;
- pelo menos um número;
- pelo menos um caractere especial.

A política deve existir:

1. no frontend, para feedback de usabilidade;
2. no backend, como validação autoritativa.

O frontend deve mostrar checklist visual e impedir envio inválido.

Nunca confiar somente na validação do frontend.

A senha:

- não deve ser normalizada de forma que altere o conteúdo digitado;
- nunca deve ser persistida em texto puro;
- nunca deve ser logada;
- nunca deve ser retornada;
- deve ser armazenada apenas como `passwordHash` usando `bcryptjs`.

`confirmPassword` é responsabilidade do formulário e não deve ser persistido.

---

# 10. Regras de usuário e autorização

Cadastro público deve produzir exclusivamente:

- `role = user`;
- `active = true`.

O cliente não pode definir `role` ou `active` no cadastro.

E-mail:

- deve ser único;
- deve ser normalizado com `trim()` e `toLowerCase()` antes de duplicidade/login.

Conta inativa não pode realizar novo login.

A alteração administrativa prevista no MVP limita-se ao estado `active`.

Não criar endpoint para elevação de privilégio sem alteração formal do escopo.

---

# 11. Regra central de propriedade

Todo recurso privado deve ser autorizado no backend.

Uma transcrição pertence exatamente a um usuário.

O proprietário deve ser obtido da identidade autenticada (`sub` do JWT), nunca de `userId` fornecido pelo cliente.

Para operações de transcrição, detalhe, áudio, download e exclusão, usar consulta equivalente a:

```text
id = :id
AND userId = :currentUser.id
```

Conhecer UUID não concede acesso.

Quando um recurso não existir **ou pertencer a outro usuário**, retornar `404`, evitando confirmar a existência de recurso alheio.

Nunca substituir essa regra por `403` em endpoints de recursos privados sem alteração da especificação.

---

# 12. Upload e armazenamento de áudio

## 12.1 Formatos previstos

- mp3;
- m4a;
- wav;
- ogg;
- webm;
- flac;
- mp4;
- mpeg.

## 12.2 Limite

Tamanho máximo: **25 MB**.

Arquivo acima do limite deve resultar em `413 FILE_TOO_LARGE`.

## 12.3 Validação

Toda entrada é não confiável.

Validar pelo menos:

- presença do arquivo;
- tamanho;
- extensão;
- MIME;
- nome recebido;
- tentativa de manipulação de caminho.

Não confiar apenas em `originalname` ou extensão.

## 12.4 Nome físico

O servidor gera nome interno, preferencialmente UUID.

O nome original é apenas metadado.

Proibido usar diretamente algo equivalente a:

```text
storage/audio/${file.originalname}
```

como estratégia de persistência.

## 12.5 Diretório privado

Áudios devem ficar fora de diretório publicado pelo frontend/web server.

Exemplo aceitável:

```text
backend/storage/audio/
```

ou estrutura equivalente configurada por `AUDIO_STORAGE_PATH`.

Nunca expor caminho físico no JSON.

Nunca transformar storage em diretório público para simplificar player ou download.

---

# 13. Integração com Groq

A integração deve ocorrer exclusivamente no backend.

Fluxo esperado:

1. autenticar;
2. validar upload;
3. gerar nome seguro;
4. armazenar arquivo;
5. enviar arquivo ao provider;
6. receber texto;
7. persistir transcrição e metadados;
8. retornar contrato público.

`GROQ_API_KEY`:

- somente em ambiente do backend;
- nunca no frontend;
- nunca em Git;
- nunca em logs;
- nunca em respostas.

Falha do provider deve ser convertida para erro controlado, por exemplo:

```text
502 TRANSCRIPTION_PROVIDER_ERROR
```

Não retornar stack trace ou resposta bruta da Groq.

## 13.1 Compensação obrigatória

Se o arquivo for salvo, mas a transcrição falhar antes da persistência válida:

1. remover o arquivo salvo;
2. não criar registro inválido;
3. retornar erro tratado.

Se persistência falhar depois de salvar arquivo, também evitar arquivo órfão.

Consistência entre banco e filesystem é requisito funcional, não otimização opcional.

---

# 14. Reprodução de áudio

Endpoint esperado:

```http
GET /api/transcriptions/:id/audio
```

Deve:

- exigir JWT;
- verificar propriedade;
- retornar MIME correto;
- não expor caminho físico;
- suportar `Range` quando aplicável;
- responder `206 Partial Content` para range válido quando implementado.

No frontend, a estratégia adotada é requisição autenticada + `Blob URL` temporária.

Não colocar JWT permanente na URL.

Não tornar arquivo público para alimentar `<audio>`.

Revogar/liberar `Blob URL` quando não for mais necessária para evitar vazamento de memória.

---

# 15. Download de áudio

Endpoint esperado:

```http
GET /api/transcriptions/:id/audio/download
```

Antes de abrir o arquivo:

1. validar JWT;
2. localizar transcrição pelo proprietário;
3. confirmar arquivo físico;
4. iniciar download.

Headers esperados incluem:

```text
Content-Type: <mimeType>
Content-Disposition: attachment; filename="<nome-seguro>"
```

O nome apresentado pode derivar do nome original, mas deve ser sanitizado para header HTTP.

Não retornar caminho interno.

---

# 16. Exclusão

Endpoint:

```http
DELETE /api/transcriptions/:id
```

A exclusão é definitiva nesta versão.

Fluxo esperado:

1. autenticar;
2. localizar por `id + owner`;
3. obter referência interna do arquivo;
4. remover arquivo físico;
5. remover registro;
6. retornar `204`.

Se o registro existir e o arquivo já estiver ausente:

- registrar o problema tecnicamente sem segredo;
- remover o registro de forma controlada;
- não expor caminho ou detalhes internos ao usuário.

Após exclusão:

- item não aparece no histórico;
- detalhe não abre;
- reprodução não funciona;
- download não funciona.

---

# 17. Contratos da API

Preservar o formato público definido pela especificação.

## 17.1 Sucesso com conteúdo

```json
{
  "data": {}
}
```

## 17.2 Lista

Quando aplicável:

```json
{
  "data": [],
  "meta": {}
}
```

Não adicionar `meta` artificialmente onde o contrato atual prevê somente `data`.

## 17.3 Erro

Formato base:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Confira os dados informados.",
  "details": []
}
```

Erros devem possuir códigos estáveis e mensagens compreensíveis.

Não retornar ao cliente:

- stack trace;
- SQL;
- caminho físico;
- resposta bruta do provider;
- segredo;
- token completo em logs/respostas de erro;
- `passwordHash`.

---

# 18. Códigos de erro relevantes

Preservar semântica já definida:

| Situação | HTTP | Código |
|---|---:|---|
| dados inválidos | 400 | `VALIDATION_ERROR` |
| senha fraca | 400 | `WEAK_PASSWORD` |
| arquivo ausente | 400 | `FILE_REQUIRED` |
| formato inválido | 400 | `INVALID_AUDIO_TYPE` |
| credenciais inválidas | 401 | `INVALID_CREDENTIALS` |
| token expirado | 401 | `TOKEN_EXPIRED` |
| sem permissão | 403 | `FORBIDDEN` |
| conta inativa | 403 | `ACCOUNT_INACTIVE` |
| transcrição não encontrada/alheia | 404 | `TRANSCRIPTION_NOT_FOUND` |
| áudio não encontrado/alheio | 404 | `AUDIO_NOT_FOUND` |
| e-mail duplicado | 409 | `EMAIL_ALREADY_EXISTS` |
| arquivo grande | 413 | `FILE_TOO_LARGE` |
| falha da Groq | 502 | `TRANSCRIPTION_PROVIDER_ERROR` |
| erro inesperado | 500 | `INTERNAL_ERROR` |

Não trocar códigos públicos existentes sem atualizar especificação, frontend e testes.

---

# 19. ValidationPipe e dados de entrada

O backend deve manter comportamento equivalente a:

```text
whitelist: true
forbidNonWhitelisted: true
transform: true
```

DTOs devem rejeitar campos proibidos.

Isso é especialmente importante para impedir mass assignment de:

- `role`;
- `active`;
- `userId`;
- campos internos de arquivo;
- outros atributos não previstos no contrato.

Strings relevantes devem ser tratadas conforme regra específica.

Não aplicar sanitização genérica que altere senha.

---

# 20. Segurança e privacidade

Toda mudança deve ser revisada contra os seguintes invariantes:

- autenticação real ocorre no backend;
- autorização real ocorre no backend;
- propriedade é verificada no backend;
- frontend nunca é fonte de autoridade;
- áudios são privados;
- diretório de storage não é público;
- segredos permanecem no backend;
- `passwordHash` nunca sai da API;
- tokens expirados são rejeitados;
- campos extras são rejeitados quando proibidos;
- recursos alheios não são revelados;
- nomes fornecidos pelo usuário não controlam paths;
- logs não contêm segredos;
- erros não expõem implementação interna.

Não enfraquecer controles para fazer teste passar.

---

# 21. Variáveis de ambiente

A configuração esperada inclui nomes equivalentes a:

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

Regras:

- `.env` nunca deve ser versionado;
- `.env.example` deve conter apenas nomes/exemplos não secretos;
- não hardcodar segredo no código;
- não criar fallback inseguro para segredo ausente;
- não preencher chave real automaticamente;
- não imprimir valores sensíveis no terminal/log.

---

# 22. Regras para frontend

## 22.1 UX obrigatória

Operações assíncronas devem tratar quando aplicável:

- `idle`;
- `loading`;
- `success`;
- `empty`;
- `error`.

Mensagens devem ser compreensíveis e não técnicas.

Durante upload/transcrição:

- desabilitar ação que causaria envio duplicado;
- informar processamento;
- tratar falha;
- exibir resultado após sucesso.

## 22.2 Sessão expirada

Ao receber `401 TOKEN_EXPIRED` ou comportamento equivalente de sessão expirada:

1. limpar `authStore`;
2. remover token persistido;
3. redirecionar para `/entrar`;
4. informar o motivo ao usuário.

Não tentar renovar silenciosamente.

## 22.3 Responsividade e acessibilidade

Telas principais devem funcionar em desktop e mobile.

Preservar suporte a `prefers-reduced-motion` onde houver animação.

Não remover feedback visual necessário em nome de simplificação estética.

---

# 23. Regras para banco de dados

PostgreSQL armazena dados estruturados:

- usuários;
- metadados da transcrição;
- texto transcrito;
- relacionamentos.

O áudio não deve ser armazenado como BLOB no PostgreSQL nesta versão.

Campos internos como `storedFileName` não devem ser retornados ao frontend sem necessidade.

Mudanças de schema devem:

- preservar dados quando aplicável;
- manter relações e propriedade;
- ser refletidas em Entity/migration/configuração conforme padrão do projeto;
- possuir teste/regressão proporcional.

---

# 24. Testes obrigatórios

Toda mudança deve ser acompanhada de validação proporcional ao risco.

## 24.1 Mudança backend

Executar, quando aplicável:

- testes automatizados afetados;
- suíte backend;
- build backend;
- teste HTTP real para contrato alterado;
- teste negativo de autorização/validação.

## 24.2 Mudança frontend

Executar, quando aplicável:

- build frontend;
- testes existentes afetados;
- verificação do fluxo alterado;
- estado de loading/error/empty;
- desktop/mobile quando houver mudança visual.

## 24.3 Mudança de autenticação/autorização

Testar obrigatoriamente cenários positivos e negativos:

- sem token;
- token inválido;
- token expirado;
- usuário comum;
- admin, quando aplicável;
- recurso próprio;
- recurso alheio.

## 24.4 Mudança de arquivos

Testar:

- arquivo válido;
- sem arquivo;
- tipo inválido;
- tamanho excedido;
- nome malicioso;
- falha após salvar;
- remoção/compensação;
- ausência física inesperada, quando relevante.

## 24.5 Integrações externas

Mocks podem validar comportamento interno, mas não substituem teste real quando o critério de aceite exige integração real.

Se `GROQ_API_KEY` não estiver disponível, registrar o teste real como `BLOQUEADO` ou `PENDENTE`, nunca como aprovado.

---

# 25. Testes de regressão mínimos por domínio

Ao alterar autenticação:

- cadastro;
- login;
- `/auth/me`;
- rota privada;
- logout;
- expiração em 5 minutos.

Ao alterar transcrições:

- criação;
- histórico;
- detalhe;
- propriedade;
- exclusão.

Ao alterar storage:

- upload;
- transcrição;
- streaming;
- download;
- exclusão;
- compensação de falha.

Ao alterar administração:

- acesso admin;
- bloqueio user;
- listagem sem `passwordHash`;
- ativação/desativação;
- login de conta inativa.

---

# 26. Definition of Done

Uma tarefa/etapa só pode ser declarada pronta quando:

1. implementação solicitada está concluída;
2. especificação continua respeitada;
3. contrato da API continua respeitado;
4. critérios de aceite relacionados foram verificados;
5. cenários de erro relevantes foram testados;
6. autorização/propriedade foi verificada quando aplicável;
7. mensagens ao usuário foram conferidas;
8. dados sensíveis não foram expostos;
9. builds/testes relevantes passaram;
10. não foram introduzidos arquivos órfãos ou inconsistência de dados;
11. documentação foi atualizada quando houve mudança relevante;
12. resultado foi verificado de forma reproduzível;
13. pendências restantes foram explicitamente informadas.

Não usar apenas “compila” como Definition of Done.

---

# 27. Procedimento antes de editar código

Antes de qualquer mudança não trivial:

1. ler a seção relevante de `docs/ESPECIFICACAO.md`;
2. ler a etapa correspondente em `PLANO_DE_ACAO.md`;
3. inspecionar implementação e testes existentes;
4. identificar contratos afetados;
5. identificar riscos de segurança/propriedade;
6. definir o menor conjunto coerente de alterações;
7. evitar refatorações não relacionadas.

Se o pedido for ambíguo e puder alterar requisito ou segurança, perguntar antes de implementar.

---

# 28. Procedimento durante a implementação

Durante alterações:

- fazer mudanças pequenas e coesas;
- preservar nomenclatura existente;
- reutilizar abstrações do projeto;
- não duplicar lógica de autenticação/headers;
- não duplicar política de senha em múltiplas implementações divergentes;
- não acessar Repository a partir de Controller;
- não acessar filesystem diretamente de páginas React;
- não acessar Groq pelo frontend;
- não confiar em IDs/roles/owners fornecidos pelo cliente;
- tratar falhas esperadas explicitamente;
- garantir cleanup de recursos temporários;
- evitar dependência nova quando a stack atual resolve o problema adequadamente.

Não realizar “melhorias” fora do escopo sem autorização.

---

# 29. Procedimento após a implementação

Ao terminar:

1. revisar diff;
2. procurar segredo acidental;
3. executar testes relevantes;
4. executar builds relevantes;
5. validar contrato HTTP quando aplicável;
6. revisar autorização horizontal;
7. verificar mensagens ao usuário;
8. atualizar documentação/plano se necessário;
9. informar exatamente o que foi validado e o que não foi.

Quando trabalhando em uma etapa do plano, encerrar a resposta com pedido explícito de autorização para avançar.

---

# 30. Política de alterações em documentação

Atualizar `docs/ESPECIFICACAO.md` quando mudar:

- requisito funcional;
- regra de negócio;
- endpoint;
- payload;
- status/código de erro;
- segurança;
- política de autenticação;
- armazenamento;
- arquitetura;
- comportamento visível ao usuário;
- critério de aceite.

Atualizar `PLANO_DE_ACAO.md` quando:

- nova etapa for aprovada;
- critério for concluído;
- surgir bloqueio;
- validação for executada;
- requisito aprovado alterar a sequência de trabalho;
- houver nova pendência.

Não marcar checkbox como concluído sem verificação correspondente.

---

# 31. Regras de Git

O agente não deve presumir autorização para operações destrutivas.

Não executar sem solicitação explícita:

- `git reset --hard`;
- `git clean -fd`;
- force push;
- rebase destrutivo;
- exclusão de branches;
- sobrescrita de trabalho não relacionado.

Antes de commit solicitado:

- revisar `git status`;
- incluir somente arquivos pertinentes;
- não versionar `.env`;
- não versionar storage local de áudio;
- não versionar segredos;
- evitar incluir artefatos de build e `node_modules`.

Se houver alterações pré-existentes do usuário fora do escopo, preservá-las.

---

# 32. Política de dependências

Antes de adicionar pacote:

1. verificar se a stack atual já oferece solução;
2. justificar necessidade;
3. preferir dependência madura e compatível;
4. evitar pacote para funcionalidade trivial;
5. atualizar lockfile junto com manifesto;
6. executar build/testes após instalação.

Não substituir bibliotecas centrais do projeto sem solicitação explícita.

---

# 33. Padrões de qualidade de código

Preferir:

- funções pequenas e com responsabilidade clara;
- nomes descritivos;
- tipos explícitos quando melhoram segurança;
- tratamento centralizado de erros repetitivos;
- constantes/configuração para valores ambientais;
- DTOs para fronteiras HTTP;
- services para domínio;
- testes focados em comportamento observável.

Evitar:

- `any` desnecessário;
- lógica duplicada;
- valores mágicos espalhados;
- catches que silenciam erro;
- logs com dados sensíveis;
- componentes gigantes;
- controllers gordos;
- acesso direto e repetido a `localStorage` em páginas;
- paths de filesystem construídos com entrada bruta.

Comentários devem explicar decisões não óbvias, não repetir o código.

---

# 34. Respostas e comunicação do agente

Ao relatar trabalho, ser verificável.

Formato recomendado:

```text
Etapa/Tarefa:

Implementado:
- ...

Arquivos principais:
- ...

Validações executadas:
- comando/teste → resultado

Critérios de aceite:
- ATENDIDO: ...
- PENDENTE/BLOQUEADO: ...

Observações/riscos:
- ...

Posso avançar para a próxima etapa?
```

Não afirmar:

- “100% concluído” sem validar todos os critérios;
- “seguro” apenas porque não houve erro de build;
- “testado” quando apenas foi feita inspeção estática;
- “Groq funcionando” se foi utilizado somente mock;
- “responsivo” sem verificação pertinente;
- “sem regressões” sem executar testes relevantes.

---

# 35. Checklist de segurança antes de finalizar mudanças críticas

Para mudanças em autenticação, arquivos, transcrições ou administração, verificar:

- [ ] `passwordHash` não aparece em resposta;
- [ ] cadastro não aceita `role`;
- [ ] cadastro não aceita `active`;
- [ ] JWT continua em 5 minutos;
- [ ] não existe refresh token;
- [ ] token expirado é rejeitado;
- [ ] `.env` não foi versionado;
- [ ] frontend não contém segredos;
- [ ] Groq continua exclusiva do backend;
- [ ] áudio continua fora de pasta pública;
- [ ] detalhe verifica proprietário;
- [ ] streaming verifica proprietário;
- [ ] download verifica proprietário;
- [ ] exclusão verifica proprietário;
- [ ] recurso alheio continua retornando `404`;
- [ ] `originalFileName` não controla path;
- [ ] erros não retornam stack;
- [ ] logs não contêm senha/token/chave;
- [ ] limite de 25 MB continua aplicado;
- [ ] MIME/tipo continuam validados;
- [ ] DTOs rejeitam campos proibidos;
- [ ] falhas não deixam arquivo órfão.

---

# 36. Fluxos críticos que não podem regredir

## Fluxo A — usuário novo

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

## Fluxo B — expiração

```text
Login
→ aguardar expiração do JWT
→ requisitar recurso privado
→ 401
→ limpar sessão
→ redirecionar para login
→ autenticar novamente
```

## Fluxo C — isolamento

Com usuários A e B:

- A cria recurso;
- B não abre detalhe de A;
- B não reproduz áudio de A;
- B não baixa áudio de A;
- B não exclui recurso de A;
- respostas não revelam que o recurso de A existe.

## Fluxo D — administração

- user comum recebe `403` em área administrativa;
- admin lista contas;
- resposta não contém `passwordHash`;
- admin desativa conta;
- conta desativada não realiza novo login;
- admin reativa conta.

---

# 37. Decisões consolidadas e invariantes

Até que a especificação seja formalmente alterada, considerar invariantes:

1. JWT expira em 5 minutos.
2. Não existe refresh token no MVP.
3. Expiração exige novo login.
4. Senha exige 8+ caracteres, letra, número e caractere especial.
5. Senha é validada no frontend e backend.
6. Áudio é armazenado persistentemente pelo backend.
7. Nome físico é gerado pelo servidor.
8. Nome original é somente metadado para exibição/download.
9. Áudio não é público.
10. Reprodução exige autenticação e propriedade.
11. Download exige autenticação e propriedade.
12. Detalhe permite comparar texto e áudio.
13. Exclusão remove registro e arquivo.
14. Falha de transcrição não deixa arquivo órfão.
15. PostgreSQL guarda dados estruturados/texto; filesystem guarda áudio.
16. Mudança de `role` não pertence ao MVP atual.
17. Recurso alheio é tratado como `404`.
18. Mudança relevante deve ser documentada antes de virar novo comportamento oficial.

---

# 38. Instrução final para qualquer agente

Antes de escrever código, responda internamente às seguintes perguntas:

1. Qual requisito ou etapa estou atendendo?
2. Essa funcionalidade já existe?
3. Quais contratos públicos podem ser afetados?
4. Existe impacto em autenticação, autorização, propriedade ou arquivos?
5. Que teste demonstra objetivamente que a mudança funciona?
6. Que teste demonstra que outro usuário não ganhou acesso indevido?
7. A mudança exige atualização da especificação ou do plano?
8. Estou prestes a avançar para outra etapa sem autorização?

Se qualquer resposta indicar risco ou divergência, resolver isso antes de ampliar a implementação.

**Prioridade do projeto: correção, segurança, consistência e rastreabilidade antes de velocidade.**
