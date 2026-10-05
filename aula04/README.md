# notas-cli

CLI para gerenciar notas de alunos: cadastro, lançamento de 3 avaliações, cálculo de média ponderada e determinação de situação (Aprovado/Exame/Reprovado).

## Instalação

```bash
cd /tep/meu-projeto/notas-cli
pip install -e .[dev]
```

## Uso Rápido

```bash
# 1. Cadastrar aluno
python3 -m notas aluno cadastrar "João Silva"
# → Aluno cadastrado com ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890

# 2. Adicionar disciplina com pesos personalizados
python3 -m notas disciplina adicionar a1b2c3d4-e5f6-7890-abcd-ef1234567890 "Matemática" --peso1 2 --peso2 3 --peso3 5

# 3. Lançar 3 avaliações
python3 -m notas nota lancar a1b2c3d4-e5f6-7890-abcd-ef1234567890 "Matemática" --av1 8.0 --av2 7.5 --av3 9.0

# 4. Consultar média ponderada
python3 -m notas media a1b2c3d4-e5f6-7890-abcd-ef1234567890 "Matemática"
# → Média ponderada: 8.30

# 5. Consultar situação
python3 -m notas situacao a1b2c3d4-e5f6-7890-abcd-ef1234567890 "Matemática"
# → Situação: Aprovado (média: 8.30)

# 6. Boletim completo (todas disciplinas do aluno)
python3 -m notas boletim a1b2c3d4-e5f6-7890-abcd-ef1234567890
# → Boletim de João Silva (a1b2c3d4...)
# → Matemática: Média 8.30 - Aprovado

# 7. Configurar pesos padrão global
python3 -m notas config-pesos --peso1 2 --peso2 3 --peso3 5
```

## Comandos Disponíveis

### Alunos
```bash
notas aluno cadastrar "Nome do Aluno"
notas aluno listar
notas aluno mostrar <id>
notas aluno remover <id>
```

### Disciplinas
```bash
notas disciplina adicionar <aluno_id> <nome> [--peso1 N] [--peso2 N] [--peso3 N]
notas disciplina listar <aluno_id>
notas disciplina remover <aluno_id> <nome>
```

### Notas
```bash
notas nota lancar <aluno_id> <disciplina> --av1 N --av2 N --av3 N
notas nota editar <aluno_id> <disciplina> [--av1 N] [--av2 N] [--av3 N]
notas nota remover <aluno_id> <disciplina>
```

### Consultas
```bash
notas media <aluno_id> <disciplina>
notas situacao <aluno_id> <disciplina>
notas boletim <aluno_id>
```

### Configuração
```bash
notas config-pesos [--peso1 N] [--peso2 N] [--peso3 N]
```

## Critérios de Situação

| Média | Situação |
|-------|----------|
| ≥ 7.0 | Aprovado |
| ≥ 5.0 | Exame |
| < 5.0 | Reprovado |

## Média Ponderada

A média é calculada com os pesos definidos por disciplina:

```
Média = (AV1 × Peso1 + AV2 × Peso2 + AV3 × Peso3) / (Peso1 + Peso2 + Peso3)
```

Exemplo com pesos 2, 3, 5:
- AV1=8.0, AV2=7.5, AV3=9.0
- Média = (8.0×2 + 7.5×3 + 9.0×5) / 10 = 83/10 = 8.30

## Armazenamento

Os dados são salvos em CSV local em `data/notas.csv`:

```csv
aluno_id,nome,disciplina,av1,av2,av3,peso1,peso2,peso3
a1b2c3d4-e5f6-7890-abcd-ef1234567890,João Silva,Matemática,8.00,7.50,9.00,2,3,5
```

A configuração de pesos padrão fica em `~/.config/notas/config.json`.

## Testes

```bash
# Rodar todos os testes
pytest -q

# Com cobertura
pytest --cov=notas
```

## Estrutura do Projeto

```
notas-cli/
├── pyproject.toml
├── README.md
├── notas/
│   ├── __init__.py
│   ├── __main__.py
│   ├── cli.py          # Interface de linha de comando
│   ├── models.py       # Dataclasses: Aluno, DisciplinaAluno, Notas, Pesos
│   ├── storage.py      # Persistência CSV
│   ├── services.py     # Regras de negócio: média, situação
│   └── config.py       # Configuração de pesos padrão
├── data/
│   └── notas.csv
└── tests/
    ├── conftest.py
    ├── test_models.py
    ├── test_storage.py
    ├── test_services.py
    └── test_cli.py
```

## Requisitos

- Python 3.10+