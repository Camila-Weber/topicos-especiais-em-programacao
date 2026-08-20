import csv
from pathlib import Path
from typing import Optional
from uuid import UUID

from notas.models import Aluno, DisciplinaAluno, Notas, Pesos


class CSVStorage:
    CAMPOS = [
        "aluno_id",
        "nome",
        "disciplina",
        "av1",
        "av2",
        "av3",
        "peso1",
        "peso2",
        "peso3",
    ]

    def __init__(self, caminho: Path) -> None:
        self.caminho = caminho
        self.caminho.parent.mkdir(parents=True, exist_ok=True)
        if not self.caminho.exists():
            self._criar_cabecalho()

    def _criar_cabecalho(self) -> None:
        with open(self.caminho, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=self.CAMPOS)
            writer.writeheader()

    def _ler_todas_linhas(self) -> list[dict]:
        with open(self.caminho, "r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            return list(reader)

    def _escrever_todas_linhas(self, linhas: list[dict]) -> None:
        with open(self.caminho, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=self.CAMPOS)
            writer.writeheader()
            writer.writerows(linhas)

    def _chave_unica(self, aluno_id: UUID, disciplina: str) -> tuple:
        return (str(aluno_id), disciplina)

    def cadastrar_aluno(self, aluno: Aluno) -> None:
        linhas = self._ler_todas_linhas()
        for linha in linhas:
            if linha["aluno_id"] == str(aluno.id):
                raise ValueError(f"Aluno com ID {aluno.id} já existe")
        linha_vazia = {
            "aluno_id": str(aluno.id),
            "nome": aluno.nome,
            "disciplina": "",
            "av1": "",
            "av2": "",
            "av3": "",
            "peso1": "",
            "peso2": "",
            "peso3": "",
        }
        linhas.append(linha_vazia)
        self._escrever_todas_linhas(linhas)

    def buscar_aluno(self, aluno_id: UUID) -> Optional[Aluno]:
        linhas = self._ler_todas_linhas()
        for linha in linhas:
            if linha["aluno_id"] == str(aluno_id) and linha["nome"]:
                return Aluno(id=UUID(linha["aluno_id"]), nome=linha["nome"])
        return None

    def listar_alunos(self) -> list[Aluno]:
        linhas = self._ler_todas_linhas()
        vistos = set()
        alunos = []
        for linha in linhas:
            aid = linha["aluno_id"]
            if aid and aid not in vistos and linha["nome"]:
                vistos.add(aid)
                alunos.append(Aluno(id=UUID(aid), nome=linha["nome"]))
        return alunos

    def remover_aluno(self, aluno_id: UUID) -> bool:
        linhas = self._ler_todas_linhas()
        novas_linhas = [l for l in linhas if l["aluno_id"] != str(aluno_id)]
        if len(novas_linhas) == len(linhas):
            return False
        self._escrever_todas_linhas(novas_linhas)
        return True

    def adicionar_disciplina(self, disciplina: DisciplinaAluno) -> None:
        linhas = self._ler_todas_linhas()
        for linha in linhas:
            if (
                linha["aluno_id"] == str(disciplina.aluno_id)
                and linha["disciplina"] == disciplina.nome
            ):
                raise ValueError(
                    f"Disciplina '{disciplina.nome}' já existe para aluno {disciplina.aluno_id}"
                )
        aluno_existe = any(
            l["aluno_id"] == str(disciplina.aluno_id) and l["nome"]
            for l in linhas
        )
        if not aluno_existe:
            raise ValueError(f"Aluno {disciplina.aluno_id} não encontrado")
        nova_linha = {
            "aluno_id": str(disciplina.aluno_id),
            "nome": "",
            "disciplina": disciplina.nome,
            "av1": "",
            "av2": "",
            "av3": "",
            "peso1": str(disciplina.pesos.peso1),
            "peso2": str(disciplina.pesos.peso2),
            "peso3": str(disciplina.pesos.peso3),
        }
        linhas.append(nova_linha)
        self._escrever_todas_linhas(linhas)

    def listar_disciplinas(self, aluno_id: UUID) -> list[DisciplinaAluno]:
        linhas = self._ler_todas_linhas()
        disciplinas = []
        for linha in linhas:
            if linha["aluno_id"] == str(aluno_id) and linha["disciplina"]:
                disciplinas.append(
                    DisciplinaAluno(
                        aluno_id=UUID(linha["aluno_id"]),
                        nome=linha["disciplina"],
                        pesos=Pesos(
                            peso1=int(linha["peso1"]),
                            peso2=int(linha["peso2"]),
                            peso3=int(linha["peso3"]),
                        ),
                    )
                )
        return disciplinas

    def remover_disciplina(self, aluno_id: UUID, nome_disciplina: str) -> bool:
        linhas = self._ler_todas_linhas()
        novas_linhas = [
            l
            for l in linhas
            if not (
                l["aluno_id"] == str(aluno_id)
                and l["disciplina"] == nome_disciplina
            )
        ]
        if len(novas_linhas) == len(linhas):
            return False
        self._escrever_todas_linhas(novas_linhas)
        return True

    def buscar_disciplina(self, aluno_id: UUID, nome: str) -> Optional[DisciplinaAluno]:
        linhas = self._ler_todas_linhas()
        for linha in linhas:
            if linha["aluno_id"] == str(aluno_id) and linha["disciplina"] == nome:
                return DisciplinaAluno(
                    aluno_id=UUID(linha["aluno_id"]),
                    nome=linha["disciplina"],
                    pesos=Pesos(
                        peso1=int(linha["peso1"]),
                        peso2=int(linha["peso2"]),
                        peso3=int(linha["peso3"]),
                    ),
                )
        return None

    def lancar_notas(self, notas: Notas) -> None:
        linhas = self._ler_todas_linhas()
        encontrado = False
        for linha in linhas:
            if (
                linha["aluno_id"] == str(notas.aluno_id)
                and linha["disciplina"] == notas.disciplina
            ):
                if linha["av1"]:
                    raise ValueError(
                        f"Notas já lançadas para {notas.disciplina} do aluno {notas.aluno_id}"
                    )
                linha["av1"] = f"{notas.av1:.2f}"
                linha["av2"] = f"{notas.av2:.2f}"
                linha["av3"] = f"{notas.av3:.2f}"
                encontrado = True
                break
        if not encontrado:
            raise ValueError(
                f"Disciplina '{notas.disciplina}' não encontrada para aluno {notas.aluno_id}"
            )
        self._escrever_todas_linhas(linhas)

    def atualizar_notas(
        self, aluno_id: UUID, disciplina: str, **kwargs: float
    ) -> None:
        linhas = self._ler_todas_linhas()
        encontrado = False
        for linha in linhas:
            if linha["aluno_id"] == str(aluno_id) and linha["disciplina"] == disciplina:
                if not linha["av1"]:
                    raise ValueError("Notas não lançadas para esta disciplina")
                for campo, valor in kwargs.items():
                    if campo in ("av1", "av2", "av3"):
                        if not 0.0 <= valor <= 10.0:
                            raise ValueError("Notas devem estar entre 0.00 e 10.00")
                        linha[campo] = f"{valor:.2f}"
                encontrado = True
                break
        if not encontrado:
            raise ValueError(
                f"Disciplina '{disciplina}' não encontrada para aluno {aluno_id}"
            )
        self._escrever_todas_linhas(linhas)

    def remover_notas(self, aluno_id: UUID, disciplina: str) -> bool:
        linhas = self._ler_todas_linhas()
        encontrado = False
        for linha in linhas:
            if linha["aluno_id"] == str(aluno_id) and linha["disciplina"] == disciplina:
                if linha["av1"]:
                    linha["av1"] = ""
                    linha["av2"] = ""
                    linha["av3"] = ""
                    encontrado = True
                break
        if not encontrado:
            return False
        self._escrever_todas_linhas(linhas)
        return True

    def buscar_notas(self, aluno_id: UUID, disciplina: str) -> Optional[Notas]:
        linhas = self._ler_todas_linhas()
        for linha in linhas:
            if linha["aluno_id"] == str(aluno_id) and linha["disciplina"] == disciplina:
                if not linha["av1"]:
                    return None
                return Notas(
                    aluno_id=UUID(linha["aluno_id"]),
                    disciplina=linha["disciplina"],
                    av1=float(linha["av1"]),
                    av2=float(linha["av2"]),
                    av3=float(linha["av3"]),
                )
        return None