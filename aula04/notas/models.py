from dataclasses import dataclass, field
from enum import Enum
from uuid import UUID, uuid4
from typing import Optional


class Situacao(Enum):
    APROVADO = "Aprovado"
    EXAME = "Exame"
    REPROVADO = "Reprovado"


@dataclass
class Pesos:
    peso1: int
    peso2: int
    peso3: int

    def __post_init__(self) -> None:
        if self.peso1 <= 0 or self.peso2 <= 0 or self.peso3 <= 0:
            raise ValueError("Pesos devem ser maiores que zero")
        if self.peso1 + self.peso2 + self.peso3 <= 0:
            raise ValueError("Soma dos pesos deve ser maior que zero")

    @property
    def soma(self) -> int:
        return self.peso1 + self.peso2 + self.peso3

    def to_tuple(self) -> tuple[int, int, int]:
        return (self.peso1, self.peso2, self.peso3)

    @classmethod
    def padrao(cls) -> "Pesos":
        return cls(peso1=2, peso2=3, peso3=5)


@dataclass
class Aluno:
    id: UUID
    nome: str

    def __post_init__(self) -> None:
        if not self.nome or not self.nome.strip():
            raise ValueError("Nome do aluno não pode ser vazio")
        self.nome = self.nome.strip()

    @classmethod
    def criar(cls, nome: str) -> "Aluno":
        return cls(id=uuid4(), nome=nome)


@dataclass
class DisciplinaAluno:
    aluno_id: UUID
    nome: str
    pesos: Pesos

    def __post_init__(self) -> None:
        if not self.nome or not self.nome.strip():
            raise ValueError("Nome da disciplina não pode ser vazio")
        self.nome = self.nome.strip()


@dataclass
class Notas:
    aluno_id: UUID
    disciplina: str
    av1: float
    av2: float
    av3: float

    def __post_init__(self) -> None:
        for nota in (self.av1, self.av2, self.av3):
            if not isinstance(nota, (int, float)):
                raise TypeError("Notas devem ser numéricas")
            if nota < 0.0 or nota > 10.0:
                raise ValueError("Notas devem estar entre 0.00 e 10.00")
        self.av1 = round(float(self.av1), 2)
        self.av2 = round(float(self.av2), 2)
        self.av3 = round(float(self.av3), 2)

    def to_tuple(self) -> tuple[float, float, float]:
        return (self.av1, self.av2, self.av3)