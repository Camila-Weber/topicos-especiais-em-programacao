# Plano de Acao Detalhado - Sistema Ditado

## Resumo

Desenvolver o **Ditado**, uma aplicacao web full stack para upload, transcricao, historico, reproducao, download e exclusao de audios transcritos.

Este arquivo e o primeiro artefato do desenvolvimento e deve ser usado como checklist vivo pela equipe.

## Regra de Execucao por Etapas

Cada etapa deve ser executada separadamente e validada antes do inicio da proxima.

Regras obrigatorias:

- Nenhuma etapa seguinte deve ser executada automaticamente sem validacao da etapa atual.
- Ao concluir uma etapa, a equipe ou agente deve apresentar o que foi feito, quais criterios de aceite foram atendidos e quais pendencias existem.
- Ao final de cada etapa, deve sempre perguntar explicitamente se pode seguir para a proxima etapa.
- Se algum criterio de aceite falhar, a etapa deve ser corrigida antes de avancar.
- Alteracoes relevantes na especificacao devem ser registradas neste plano antes de continuar.

Criterios de aceite desta regra:

- [x] O plano declara que cada etapa precisa ser validada antes da proxima.
- [x] O plano declara que deve haver pergunta ao final de cada etapa.
- [x] O plano declara que criterios pendentes bloqueiam o avanco.

## 1. Registro do Plano

Subetapas:

- [x] Criar `PLANO_DE_ACAO.md`.
- [x] Registrar fases, subetapas, criterios de aceite e fluxos principais.
- [ ] Atualizar este plano sempre que a especificacao mudar.

Criterios de aceite:

- [x] `PLANO_DE_ACAO.md` existe no repositorio.
- [x] O plano contem etapas, subetapas e criterios de aceite.
- [x] O plano pode ser usado como checklist.
- [x] O plano nao contem segredos reais.

## 2. Preparacao e Base do Projeto

Subetapas:

- [x] Criar `frontend/`, `backend/`, `docs/`.
- [x] Criar `.env.example`, `.gitignore` e `docker-compose.yml`.
- [x] Configurar PostgreSQL 17.
- [x] Criar backend NestJS.
- [x] Criar frontend React + Vite.
- [x] Criar `GET /api/health`.

Criterios de aceite:

- [x] Estrutura inicial foi criada.
- [x] `.env.example` nao contem segredos reais.
- [x] `.gitignore` ignora `.env`, `node_modules`, builds e storage local.
- [ ] `docker compose up -d` sobe PostgreSQL. Pendente: Docker nao esta disponivel neste WSL.
- [ ] Backend inicia sem erro. Pendente de validacao com PostgreSQL em execucao.
- [x] Frontend compila sem erro.
- [ ] `GET /api/health` retorna `200`. Pendente de validacao com backend em execucao.
- [ ] Frontend consome `/api/health`. Pendente de validacao integrada com backend em execucao.

## 3. Fluxo do Visitante

Subetapas:

- [x] Criar landing page `/`.
- [x] Criar rotas publicas `/cadastro` e `/entrar`.
- [x] Proteger `/app`, `/app/historico`, `/app/transcricoes/:id` e `/app/admin/usuarios`.

Criterios de aceite:

- [x] Visitante acessa landing, cadastro e login.
- [x] Visitante sem token nao acessa area interna.
- [x] Tentativa de rota privada redireciona para `/entrar`.
- [x] Landing funciona em desktop e mobile.

## 4. Fluxo de Cadastro

Subetapas:

- [x] Criar entidade `User`.
- [x] Implementar `POST /api/auth/register`.
- [x] Validar nome, e-mail e senha.
- [x] Normalizar e-mail.
- [x] Persistir `passwordHash`.
- [x] Criar formulario com checklist de senha.

Criterios de aceite:

- [x] Nome ausente retorna erro.
- [x] E-mail invalido retorna erro.
- [x] E-mail duplicado retorna `409 EMAIL_ALREADY_EXISTS`.
- [x] Senha fraca retorna `400 WEAK_PASSWORD`.
- [x] `role` e `active` enviados pelo cliente sao rejeitados.
- [x] Usuario criado recebe `role = user` e `active = true`.
- [x] `passwordHash` nunca aparece em JSON.

Validacao:

- [x] Testes automatizados do backend passaram.
- [x] Build do backend passou.
- [x] Build do frontend passou.
- [ ] Teste HTTP real pendente porque o PostgreSQL/Docker nao esta disponivel neste WSL.

## 5. Fluxo de Login, Logout e Sessao

Subetapas:

- [x] Implementar `POST /api/auth/login`.
- [x] Bloquear conta inativa.
- [x] Emitir JWT de 5 minutos.
- [x] Implementar `GET /api/auth/me`.
- [x] Criar `authStore`, interceptor axios e logout.

Criterios de aceite:

- [x] Login correto retorna usuario e token.
- [x] Login incorreto retorna `401 INVALID_CREDENTIALS`.
- [x] Conta inativa retorna `403 ACCOUNT_INACTIVE`.
- [x] Token contem `sub` e `role`.
- [x] Token expira em cerca de 300 segundos.
- [x] Token expirado limpa sessao e redireciona para `/entrar`.

Validacao:

- [x] Testes automatizados do backend passaram.
- [x] Build do backend passou.
- [x] Build do frontend passou.
- [ ] Teste HTTP real pendente porque o PostgreSQL/Docker nao esta disponivel neste WSL.

## 6. Fluxo de Nova Transcricao

Subetapas:

- [ ] Criar `StorageService`.
- [ ] Criar entidade `Transcription`.
- [ ] Criar provider Groq.
- [ ] Implementar `POST /api/transcriptions`.
- [ ] Criar tela `/app`.

Criterios de aceite:

- [ ] Upload exige autenticacao.
- [ ] Sem arquivo retorna `FILE_REQUIRED`.
- [ ] Tipo invalido retorna `INVALID_AUDIO_TYPE`.
- [ ] Arquivo maior que 25 MB retorna `FILE_TOO_LARGE`.
- [ ] Arquivo valido e salvo em diretorio privado.
- [ ] Groq e chamada somente pelo backend.
- [ ] Falha antes da persistencia remove arquivo salvo.

## 7. Fluxo de Historico

Subetapas:

- [ ] Implementar `GET /api/transcriptions`.
- [ ] Criar `/app/historico`.
- [ ] Exibir lista, estado vazio e acesso ao detalhe.

Criterios de aceite:

- [ ] Historico exige JWT.
- [ ] Usuario ve somente suas transcricoes.
- [ ] Lista vem em `createdAt DESC`.
- [ ] `storedFileName` nao aparece na listagem.

## 8. Fluxo de Detalhe da Transcricao

Subetapas:

- [ ] Implementar `GET /api/transcriptions/:id`.
- [ ] Criar `/app/transcricoes/:id`.
- [ ] Exibir texto, player, download e exclusao.

Criterios de aceite:

- [ ] Detalhe exige JWT.
- [ ] Recurso alheio retorna `404`.
- [ ] Texto completo e exibido.
- [ ] Caminho fisico nao e exibido.

## 9. Fluxo de Reproducao do Audio

Subetapas:

- [ ] Implementar `GET /api/transcriptions/:id/audio`.
- [ ] Validar propriedade.
- [ ] Criar player com `Blob URL` autenticada.

Criterios de aceite:

- [ ] Usuario reproduz audio proprio.
- [ ] Audio alheio retorna `404`.
- [ ] Sem token retorna `401`.
- [ ] Diretorio de audio nao e publico.

## 10. Fluxo de Download

Subetapas:

- [ ] Implementar `GET /api/transcriptions/:id/audio/download`.
- [ ] Adicionar botao de download.

Criterios de aceite:

- [ ] Download exige autenticacao.
- [ ] Audio alheio retorna `404`.
- [ ] `Content-Disposition` usa `attachment`.
- [ ] Caminho interno nunca e exibido.

## 11. Fluxo de Exclusao

Subetapas:

- [ ] Implementar `DELETE /api/transcriptions/:id`.
- [ ] Confirmar exclusao no frontend.
- [ ] Atualizar historico.

Criterios de aceite:

- [ ] Exclusao exige autenticacao.
- [ ] Arquivo fisico e registro sao removidos.
- [ ] Item deixa de aparecer no historico.
- [ ] Falhas nao expõem detalhes internos.

## 12. Fluxo Administrativo

Subetapas:

- [ ] Criar guard `admin`.
- [ ] Implementar `GET /api/users`.
- [ ] Implementar `PATCH /api/users/:id`.
- [ ] Criar `/app/admin/usuarios`.

Criterios de aceite:

- [ ] Admin lista usuarios.
- [ ] Usuario comum recebe `403`.
- [ ] `passwordHash` nunca e retornado.
- [ ] Admin ativa/desativa conta.
- [ ] Mudanca de `role` nao ocorre neste MVP.

## 13. Revisao de Seguranca

Criterios de aceite:

- [ ] JWT expira em 5 minutos.
- [ ] Nao existe refresh token.
- [ ] `.env` nao esta versionado.
- [ ] Frontend nao contem `GROQ_API_KEY`.
- [ ] Groq nunca e chamada pelo navegador.
- [ ] Audio nao fica em pasta publica.
- [ ] Recursos alheios retornam `404`.
- [ ] Erros nao retornam stack trace.

## 14. Testes de Aceite Final

Fluxos:

- [ ] Usuario novo: cadastro, login, upload, transcricao, reproducao, download, historico, detalhe, exclusao e logout.
- [ ] Token expirado: aguardar mais de 5 minutos, receber `401`, limpar sessao e voltar ao login.
- [ ] Isolamento: usuario B nao acessa recursos do usuario A.
- [ ] Admin: listar, desativar e reativar contas.

Criterios de aceite:

- [ ] Todos os fluxos principais foram testados.
- [ ] Todos os fluxos criticos de erro foram testados.
- [ ] Sistema funciona em desktop e mobile.
- [ ] Nenhum dado sensivel e exposto.
- [ ] Banco e arquivos permanecem consistentes.

## Decisoes Consolidadas

- O armazenamento de audio sera local e privado no backend.
- O player usara `Blob URL` temporaria gerada por requisicao autenticada.
- PostgreSQL guardara usuarios, metadados e texto; arquivos ficam no sistema de arquivos.
- Nao entram no MVP: refresh token, recuperacao de senha, autenticacao social, compartilhamento publico, edicao colaborativa, pagamento ou exportacao PDF/DOCX.
