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
- [x] `docker compose up -d` sobe PostgreSQL.
- [x] Backend inicia sem erro.
- [x] Frontend compila sem erro.
- [x] `GET /api/health` retorna `200`.
- [x] Frontend consome `/api/health`.

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
- [x] Teste HTTP real com PostgreSQL passou na etapa 14.

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
- [x] Teste HTTP real com PostgreSQL passou na etapa 14.

## 6. Fluxo de Nova Transcricao

Subetapas:

- [x] Criar `StorageService`.
- [x] Criar entidade `Transcription`.
- [x] Criar provider Groq.
- [x] Implementar `POST /api/transcriptions`.
- [x] Criar tela `/app`.

Criterios de aceite:

- [x] Upload exige autenticacao.
- [x] Sem arquivo retorna `FILE_REQUIRED`.
- [x] Tipo invalido retorna `INVALID_AUDIO_TYPE`.
- [x] Arquivo maior que 25 MB retorna `FILE_TOO_LARGE`.
- [x] Arquivo valido e salvo em diretorio privado.
- [x] Groq e chamada somente pelo backend.
- [x] Falha antes da persistencia remove arquivo salvo.

Validacao:

- [x] Testes automatizados do backend passaram.
- [x] Build do backend passou.
- [x] Build do frontend passou.
- [x] Teste HTTP real de validacoes de upload e falha controlada da Groq passou na etapa 14.
- [ ] Transcricao real bem-sucedida pela Groq depende de configurar `GROQ_API_KEY`.

## 7. Fluxo de Historico

Subetapas:

- [x] Implementar `GET /api/transcriptions`.
- [x] Criar `/app/historico`.
- [x] Exibir lista, estado vazio e acesso ao detalhe.

Criterios de aceite:

- [x] Historico exige JWT.
- [x] Usuario ve somente suas transcricoes.
- [x] Lista vem em `createdAt DESC`.
- [x] `storedFileName` nao aparece na listagem.

Validacao:

- [x] Testes automatizados do backend passaram.
- [x] Build do backend passou.
- [x] Build do frontend passou.
- [x] Teste HTTP real com PostgreSQL passou na etapa 14.

## 8. Fluxo de Detalhe da Transcricao

Subetapas:

- [x] Implementar `GET /api/transcriptions/:id`.
- [x] Criar `/app/transcricoes/:id`.
- [x] Exibir texto, player, download e exclusao.

Criterios de aceite:

- [x] Detalhe exige JWT.
- [x] Recurso alheio retorna `404`.
- [x] Texto completo e exibido.
- [x] Caminho fisico nao e exibido.

Validacao:

- [x] Testes automatizados do backend passaram.
- [x] Build do backend passou.
- [x] Build do frontend passou.
- [x] Player, download e exclusao foram implementados nas etapas 9, 10 e 11.
- [x] Teste HTTP real com PostgreSQL passou na etapa 14.

## 9. Fluxo de Reproducao do Audio

Subetapas:

- [x] Implementar `GET /api/transcriptions/:id/audio`.
- [x] Validar propriedade.
- [x] Criar player com `Blob URL` autenticada.

Criterios de aceite:

- [x] Usuario reproduz audio proprio.
- [x] Audio alheio retorna `404`.
- [x] Sem token retorna `401`.
- [x] Diretorio de audio nao e publico.

Validacao:

- [x] Testes automatizados do backend passaram.
- [x] Build do backend passou.
- [x] Build do frontend passou.
- [x] Endpoint suporta `Range` quando informado.
- [x] Teste HTTP real com PostgreSQL passou na etapa 14.

## 10. Fluxo de Download

Subetapas:

- [x] Implementar `GET /api/transcriptions/:id/audio/download`.
- [x] Adicionar botao de download.

Criterios de aceite:

- [x] Download exige autenticacao.
- [x] Audio alheio retorna `404`.
- [x] `Content-Disposition` usa `attachment`.
- [x] Caminho interno nunca e exibido.

Validacao:

- [x] Testes automatizados do backend passaram.
- [x] Build do backend passou.
- [x] Build do frontend passou.
- [x] Teste HTTP real com PostgreSQL passou na etapa 14.

## 11. Fluxo de Exclusao

Subetapas:

- [x] Implementar `DELETE /api/transcriptions/:id`.
- [x] Confirmar exclusao no frontend.
- [x] Atualizar historico.

Criterios de aceite:

- [x] Exclusao exige autenticacao.
- [x] Arquivo fisico e registro sao removidos.
- [x] Item deixa de aparecer no historico.
- [x] Falhas nao expõem detalhes internos.

Validacao:

- [x] Testes automatizados do backend passaram.
- [x] Build do backend passou.
- [x] Build do frontend passou.
- [x] Teste HTTP real com PostgreSQL passou na etapa 14.

## 12. Fluxo Administrativo

Subetapas:

- [x] Criar guard `admin`.
- [x] Implementar `GET /api/users`.
- [x] Implementar `PATCH /api/users/:id`.
- [x] Criar `/app/admin/usuarios`.

Criterios de aceite:

- [x] Admin lista usuarios.
- [x] Usuario comum recebe `403`.
- [x] `passwordHash` nunca e retornado.
- [x] Admin ativa/desativa conta.
- [x] Mudanca de `role` nao ocorre neste MVP.

Validacao:

- [x] Testes automatizados do backend passaram.
- [x] Build do backend passou.
- [x] Build do frontend passou.
- [x] Teste HTTP real com PostgreSQL passou na etapa 14.

## 13. Revisao de Seguranca

Criterios de aceite:

- [x] JWT expira em 5 minutos.
- [x] Nao existe refresh token.
- [x] `.env` nao esta versionado.
- [x] Frontend nao contem `GROQ_API_KEY`.
- [x] Groq nunca e chamada pelo navegador.
- [x] Audio nao fica em pasta publica.
- [x] Recursos alheios retornam `404`.
- [x] Erros nao retornam stack trace.

Validacao:

- [x] Testes automatizados do backend passaram.
- [x] Build do backend passou.
- [x] Build do frontend passou.
- [x] Busca no codigo-fonte confirmou ausencia de `GROQ_API_KEY` no frontend.
- [x] Filtro global de excecoes adicionado para nao retornar stack trace.
- [x] Teste HTTP real com PostgreSQL passou na etapa 14.

## 14. Testes de Aceite Final

Fluxos:

- [ ] Usuario novo: cadastro, login, upload, transcricao, reproducao, download, historico, detalhe, exclusao e logout. Pendente apenas transcricao real bem-sucedida pela Groq com `GROQ_API_KEY`.
- [x] Token expirado: receber `401 TOKEN_EXPIRED`, limpar sessao e voltar ao login. Validado com token expirado gerado para teste.
- [x] Isolamento: usuario B nao acessa recursos do usuario A.
- [x] Admin: listar, desativar e reativar contas.

Criterios de aceite:

- [ ] Todos os fluxos principais foram testados. Pendente apenas sucesso real de transcricao pela Groq.
- [x] Todos os fluxos criticos de erro foram testados.
- [x] Sistema funciona em desktop e mobile.
- [x] Nenhum dado sensivel e exposto.
- [x] Banco e arquivos permanecem consistentes.

Validacao:

- [x] `docker compose up -d` subiu PostgreSQL 17.
- [x] Backend iniciou com PostgreSQL.
- [x] Frontend iniciou com Vite.
- [x] Proxy `/api/health` do frontend retornou `200`.
- [x] Suite HTTP real passou em 45/45 verificacoes.
- [x] Builds de backend e frontend passaram.
- [x] Testes automatizados do backend passaram.
- [ ] Teste de transcricao real com Groq pendente por falta de `GROQ_API_KEY`.

## 15. Evolucao da Landing Page

Objetivo:

- [x] Ampliar a landing page `/` para apresentar melhor o sistema Ditado.
- [x] Manter foco em produto e fluxos do usuario.
- [x] Adicionar interatividade moderada sem novas dependencias.
- [x] Usar objetos visuais com movimento e transicoes suaves.

Subetapas:

- [x] Registrar este plano como novo topico do `PLANO_DE_ACAO.md`.
- [x] Reorganizar a landing com hero maior, mockup demonstrativo, secoes de fluxo, seguranca, recursos e chamada final.
- [x] Criar cards de fluxo interativos com descricao detalhada da etapa selecionada.
- [x] Criar mockup demonstrativo com estados de upload, transcricao e conclusao.
- [x] Adicionar movimento leve em ondas, barras de audio, indicadores e cards.
- [x] Preservar status da API consumindo `GET /api/health`.
- [x] Garantir layout responsivo em desktop e mobile.
- [x] Adicionar suporte a `prefers-reduced-motion`.

Criterios de aceite:

- [x] `/` continua acessivel para visitantes.
- [x] Botoes de cadastro e login continuam apontando para `/cadastro` e `/entrar`.
- [x] Landing contem mais informacoes sobre proposta, fluxo, seguranca, recursos e administracao.
- [x] Ha partes interativas sem exigir login nem alterar dados reais.
- [x] Elementos visuais possuem transicoes suaves.
- [x] Nenhum segredo, token ou caminho interno e exibido.
- [x] Layout funciona em desktop e mobile.
- [x] Build do frontend passa.

Validacao:

- [x] Build do frontend passou apos a implementacao.
- [ ] Validacao visual manual no navegador.

## 16. Nova Tela de Envio de Transcricao

Objetivo:

- [x] Redesenhar `/app` como tela dedicada de envio e resultado imediato.
- [x] Separar o historico em `/app/historico`, sem misturar listagem na tela de envio.
- [x] Adicionar campo de arrastar e soltar para audio/video.
- [x] Trocar idioma livre por `select` com opcoes amigaveis.

Subetapas:

- [x] Registrar esta etapa no `PLANO_DE_ACAO.md`.
- [x] Criar lista controlada de idiomas: Portugues, Ingles, Espanhol, Frances, Alemao e Italiano.
- [x] Validar no backend que apenas `pt`, `en`, `es`, `fr`, `de` e `it` sao aceitos.
- [x] Criar dropzone para arrastar/selecionar `audio/*` e `video/mp4`.
- [x] Validar visualmente arquivo ausente, tipo invalido e tamanho acima de 25 MB.
- [x] Exibir nome, tamanho, formato e idioma antes do envio.
- [x] Mostrar estados de vazio, selecionado, carregando, sucesso e erro.
- [x] Exibir resultado imediato com texto, player local, link para detalhe e link para historico.

Criterios de aceite:

- [x] Usuario consegue arrastar audio/video para a tela.
- [x] Usuario consegue selecionar arquivo por clique.
- [x] Usuario escolhe idioma apenas pelas opcoes do select.
- [x] Select mostra nomes completos dos idiomas.
- [x] Idioma invalido enviado manualmente para API retorna `400 INVALID_LANGUAGE`.
- [x] Tela informa nome, tamanho, tipo e idioma antes de enviar.
- [x] Envio sem arquivo e impedido.
- [x] Arquivos invalidos exibem mensagem amigavel.
- [x] Sucesso mostra texto transcrito e caminho para detalhe/historico.
- [x] Historico nao aparece misturado na tela de envio.
- [x] Build do frontend passa.

Validacao:

- [x] Testes automatizados do backend passaram.
- [x] Build do backend passou.
- [x] Build do frontend passou.
- [ ] Validacao visual manual no navegador.

## 17. Historico com Pesquisa Paginada

Objetivo:

- [ ] Evoluir `/app/historico` com busca, filtros e paginacao.
- [ ] Manter abertura de detalhe em `/app/transcricoes/:id`.
- [ ] Pedir autorizacao antes de iniciar esta etapa.

Subetapas:

- [ ] Alterar `GET /api/transcriptions` para aceitar `page`, `pageSize`, `q`, `language`, `dateFrom` e `dateTo`.
- [ ] Retornar `data` e `meta` com dados de paginacao.
- [ ] Filtrar sempre por usuario autenticado.
- [ ] Buscar por nome original e texto transcrito.
- [ ] Filtrar idioma por select com nomes completos.
- [ ] Filtrar por intervalo de datas.
- [ ] Atualizar frontend do historico com pesquisa, filtros, paginacao e estados de carregamento/vazio/erro.

Criterios de aceite:

- [ ] Historico exige JWT.
- [ ] Pesquisa por texto encontra nome de arquivo e conteudo transcrito.
- [ ] Filtro de idioma funciona com select.
- [ ] Idioma invalido na query retorna `400 INVALID_LANGUAGE`.
- [ ] Filtros de data funcionam.
- [ ] Paginacao mostra total e navega corretamente.
- [ ] Usuario ve apenas suas transcricoes.
- [ ] Detalhe abre pela pagina existente.
- [ ] Listagem nao expoe `storedFileName`.
- [ ] Testes do backend e build do frontend passam.

## 18. Validacao Integrada e Documentacao

Objetivo:

- [ ] Atualizar documentacao apos autorizacao e conclusao da etapa 17.
- [ ] Validar o fluxo integrado de envio, historico, busca, detalhe e exclusao.
- [ ] Pedir autorizacao antes de iniciar esta etapa.

Subetapas:

- [ ] Atualizar `README.md` com nova experiencia de envio.
- [ ] Documentar idiomas disponiveis com nome completo e sigla enviada.
- [ ] Documentar parametros de busca paginada.
- [ ] Validar envio por clique e drag and drop.
- [ ] Validar arquivo invalido e idioma invalido direto na API.
- [ ] Validar busca, filtro de idioma, filtro de data e paginacao.
- [ ] Validar abertura de detalhe, exclusao e atualizacao de lista.

Criterios de aceite:

- [ ] Plano atualizado.
- [ ] README atualizado.
- [ ] Testes automatizados do backend passam.
- [ ] Build do backend passa.
- [ ] Build do frontend passa.
- [ ] Validacao manual do fluxo principal marcada no plano.

## Decisoes Consolidadas

- O armazenamento de audio sera local e privado no backend.
- O player usara `Blob URL` temporaria gerada por requisicao autenticada.
- PostgreSQL guardara usuarios, metadados e texto; arquivos ficam no sistema de arquivos.
- Nao entram no MVP: refresh token, recuperacao de senha, autenticacao social, compartilhamento publico, edicao colaborativa, pagamento ou exportacao PDF/DOCX.
