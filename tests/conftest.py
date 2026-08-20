import pytest
from pathlib import Path
from uuid import uuid4

from notas.models import Aluno, DisciplinaAluno, Notas, Pesos
from notas.storage import CSVStorage


@pytest.fixture
def tmp_csv_path(tmp_path: Path) -> Path:
    return tmp_path / "notas.csv"


@pytest.fixture
def storage_vazio(tmp_csv_path: Path) -> CSVStorage:
    return CSVStorage(tmp_csv_path)


@pytest.fixture
def aluno_exemplo() -> Aluno:
    return Aluno.criar("João Silva")


@pytest.fixture
def aluno_com_id() -> Aluno:
    return Aluno(id=uuid4(), nome="Maria Santos")


@pytest.fixture
def pesos_padrao() -> Pesos:
    return Pesos.padrao()


@pytest.fixture
def disciplina_exemplo(aluno_exemplo: Aluno, pesos_padrao: Pesos) -> DisciplinaAluno:
    return DisciplinaAluno(
        aluno_id=aluno_exemplo.id, nome="Matemática", pesos=pesos_padrao
    )


@pytest.fixture
def notas_exemplo(aluno_exemplo: Aluno) -> Notas:
    return Notas(
        aluno_id=aluno_exemplo.id,
        disciplina="Matemática",
        av1=8.0,
        av2=7.5,
        av3=9.0,
    )