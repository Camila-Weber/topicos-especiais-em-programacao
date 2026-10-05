# Agentes - CLI de Notas

## Visão Geral
CLI para gerenciar notas de alunos: cadastro, lançamento de 3 avaliações, cálculo de média ponderada e determinação de situação (Aprovado/Exame/Reprovado).

**Público-alvo**: Alunos do 3º semestre de Python
**Armazenamento**: CSV local (sem banco, sem rede)
**Testes**: pytest
**Entry point**: `python -m notas`

---

## Decisões Técnicas

| Item | Decisão |
|------|---------|
| ID Aluno | UUID (ex: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`) |
| Precisão notas | 2 casas decimais (0.00 - 10.00) |    
| Pesos | Configuráveis via CLI/CSV (padrão global em `~/.config/notas/config.json`) |
| Critérios situação | ≥7.0 Aprovado, ≥5.0 Exame, <5.0 Reprovado |
| Múltiplas disciplinas | Sim (um aluno pode ter várias disciplinas) |
| Edição/Exclusão | Sim (notas, disciplinas, alunos) |
| Configuração | `~/.config/notas/config.json` (pesos padrão por usuário) |

---

## Estrutura do Projeto

```
/home/camila/tep/meu-projeto/notas-cli/
├── pyproject.toml
├── README.md
├── notas/
│   ├── __init__.py
│   ├── __main__.py
│   ├── cli.py
│   ├── models.py
│   ├── storage.py
│   ├── services.py
│   └── config.py
├── data/
│   └── notas.csv
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── test_models.py
    ├── test_storage.py
    ├── test_services.py
    └── test_cli.py
```

---

## Módulos e Responsabilidades

### `models.py`
```python
@dataclass
class Aluno:
    id: UUID
    nome: str

@dataclass
class DisciplinaAluno:
    aluno_id: UUID
    nome: str
    pesos: Pesos

@dataclass
class Notas:
    aluno_id: UUID
    disciplina: str
    av1: float
    av2: float
    av3: float

@dataclass
class Pesos:
    peso1: int
    peso2: int
    peso3: int
    # validação: soma > 0

class Situacao(Enum):
    APROVADO = "Aprovado"
    EXAME = "Exame"
    REPROVADO = "Reprovado"
```

### `storage.py` - CSVStorage
**CSV columns**: `aluno_id,nome,disciplina,av1,av2,av3,peso1,peso2,peso3`
**Índice único**: `(aluno_id, disciplina)`

Métodos principais:
- `cadastrar_aluno(aluno: Aluno) -> None`
- `buscar_aluno(id: UUID) -> Aluno | None`
- `listar_alunos() -> list[Aluno]`
- `remover_aluno(id: UUID) -> bool`
- `adicionar_disciplina(disc: DisciplinaAluno) -> None`
- `listar_disciplinas(aluno_id: UUID) -> list[DisciplinaAluno]`
- `remover_disciplina(aluno_id: UUID, nome: str) -> bool`
- `lancar_notas(notas: Notas) -> None`
- `atualizar_notas(aluno_id: UUID, disciplina: str, **kwargs) -> None`
- `remover_notas(aluno_id: UUID, disciplina: str) -> bool`
- `buscar_notas(aluno_id: UUID, disciplina: str) -> Notas | None`

### `services.py`
```python
def calcular_media(notas: Notas, pesos: Pesos) -> float:
    # (av1*p1 + av2*p2 + av3*p3) / (p1+p2+p3)
    # round(resultado, 2)

def determinar_situacao(media: float) -> Situacao:
    if media >= 7.0: return Situacao.APROVADO
    if media >= 5.0: return Situacao.EXAME
    return Situacao.REPROVADO
```

### `config.py`
- Arquivo: `~/.config/notas/config.json`
- Estrutura: `{"peso1": 2, "peso2": 3, "peso3": 5}`
- `Config.carregar() -> Pesos`
- `Config.salvar(pesos: Pesos) -> None`
- Fallback: pesos padrão hardcoded (2, 3, 5)

### `cli.py` - argparse com subcomandos
```
notas
├── aluno
│   ├── cadastrar <nome>
│   ├── listar
│   ├── mostrar <id>
│   └── remover <id>
├── disciplina
│   ├── adicionar <aluno_id> <nome> [--peso1 --peso2 --peso3]
│   ├── listar <aluno_id>
│   └── remover <aluno_id> <nome>
├── nota
│   ├── lancar <aluno_id> <disciplina> --av1 --av2 --av3
│   ├── editar <aluno_id> <disciplina> [--av1] [--av2] [--av3]
│   └── remover <aluno_id> <disciplina>
├── media <aluno_id> <disciplina>
├── situacao <aluno_id> <disciplina>
├── boletim <aluno_id>
└── config-pesos [--peso1 --peso2 --peso3]
```

---

## Formato CSV (data/notas.csv)
```csv
aluno_id,nome,disciplina,av1,av2,av3,peso1,peso2,peso3
a1b2c3d4-e5f6-7890-abcd-ef1234567890,João Silva,Matemática,8.00,7.50,9.00,2,3,5
a1b2c3d4-e5f6-7890-abcd-ef1234567890,João Silva,Física,6.00,7.00,8.00,2,3,5
```

---

## Testes (pytest)

### `conftest.py`
- `tmp_path` fixture para isolamento de CSV
- `storage_vazio` fixture
- `aluno_exemplo` fixture
- `disciplina_exemplo` fixture

### `test_models.py`
- Criação de Aluno com UUID válido
- Validação de precisão 2 casas decimais em Notas
- Enum Situacao: valores e comparação
- Pesos: validação soma > 0

### `test_storage.py`
- CRUD Aluno (criar, buscar, listar, remover)
- CRUD Disciplina (adicionar, listar, remover)
- CRUD Notas (lançar, editar, remover, buscar)
- Integridade: índice único (aluno_id, disciplina)
- Isolamento: cada teste usa CSV temporário

### `test_services.py`
- `calcular_media`: pesos variados, precisão 2 casas
- `determinar_situacao`: bordas 5.00, 7.00, valores exatos
- Casos: 4.99→REPROVADO, 5.00→EXAME, 6.99→EXAME, 7.00→APROVADO

### `test_cli.py`
- Fluxo E2E completo via `subprocess` ou `CliRunner`
- Cadastrar → Adicionar disciplina → Lançar notas → Média → Situação → Boletim
- Tratamento de erros: ID inexistente, disciplina inexistente, notas inválidas
- Comandos de configuração de pesos

---

## Exemplo de Uso (README.md)

```bash
# 1. Cadastrar aluno
python -m notas aluno cadastrar "João Silva"
# → ID gerado: a1b2c3d4-e5f6-7890-abcd-ef1234567890

# 2. Adicionar disciplina com pesos personalizados
python -m notas disciplina adicionar a1b2c3d4... "Matemática" --peso1 2 --peso2 3 --peso3 5

# 3. Lançar 3 avaliações
python -m notas nota lancar a1b2c3d4... "Matemática" --av1 8.0 --av2 7.5 --av3 9.0

# 4. Consultar média ponderada
python -m notas media a1b2c3d4... "Matemática"
# → Média: 8.30

# 5. Consultar situação
python -m notas situacao a1b2c3d4... "Matemática"
# → Situação: Aprovado

# 6. Boletim completo (todas disciplinas do aluno)
python -m notas boletim a1b2c3d4...
# → Matemática: Média 8.30 - Aprovado
# → Física: Média 7.10 - Aprovado

# 7. Configurar pesos padrão global
python -m notas config-pesos --peso1 2 --peso2 3 --peso3 5
```

---

## Critérios de Aceite

1. ✅ `pytest -q` passa (todos os testes verdes)
2. ✅ `python -m notas` roda e mostra help/usage
3. ✅ README.md com exemplo de uso completo funcionando

---

## pyproject.toml

```toml
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "notas-cli"
version = "0.1.0"
description = "CLI de notas com média ponderada e situação"
readme = "README.md"
requires-python = ">=3.10"
dependencies = []

[project.optional-dependencies]
dev = ["pytest>=7.0", "pytest-cov"]

[project.scripts]
notas = "notas.__main__:main"

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
addopts = "-q"
```

---

## Ordem de Implementação Sugerida

1. **Estrutura base**: pastas, `pyproject.toml`, `__init__.py`
2. **models.py**: Dataclasses + Enum + validações
3. **config.py**: Carregar/salvar `~/.config/notas/config.json`
4. **storage.py**: CSVStorage com CRUD completo
5. **services.py**: `calcular_media`, `determinar_situacao`
6. **cli.py**: argparse com todos subcomandos
7. **__main__.py**: Entry point simples
8. **Testes**: Paralelo à implementação (TDD leve)
9. **README.md**: Documentação + exemplo completo
10. **Validação**: `pytest -q` e `python -m notas`

---

## Notas para Desenvolvedores (Alunos 3º semestre)

- Usar `dataclasses` + `field` + `__post_init__` para validação
- `csv.DictReader`/`DictWriter` para CSV
- `argparse` com `add_subparsers()` para subcomandos
- `pathlib.Path` para caminhos (especialmente `~/.config/notas/`)
- `uuid.uuid4()` para IDs
- `round(valor, 2)` para precisão
- Type hints obrigatórios em tudo
- Docstrings no estilo Google/NumPy
- Testes com `tmp_path` para isolamento de filesystem