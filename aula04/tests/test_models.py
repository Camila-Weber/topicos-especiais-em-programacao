import pytest
from uuid import UUID, uuid4

from notas.models import Aluno, DisciplinaAluno, Notas, Pesos, Situacao


class TestPesos:
    def test_pesos_padrao(self) -> None:
        pesos = Pesos.padrao()
        assert pesos.peso1 == 2
        assert pesos.peso2 == 3
        assert pesos.peso3 == 5

    def test_pesos_soma(self) -> None:
        pesos = Pesos(peso1=2, peso2=3, peso3=5)
        assert pesos.soma == 10

    def test_pesos_validos(self) -> None:
        pesos = Pesos(peso1=1, peso2=1, peso3=1)
        assert pesos.to_tuple() == (1, 1, 1)

    def test_peso_zero_levanta_erro(self) -> None:
        with pytest.raises(ValueError, match="maiores que zero"):
            Pesos(peso1=0, peso2=3, peso3=5)

    def test_peso_negativo_levanta_erro(self) -> None:
        with pytest.raises(ValueError, match="maiores que zero"):
            Pesos(peso1=-1, peso2=3, peso3=5)


class TestAluno:
    def test_criar_aluno_gera_uuid(self) -> None:
        aluno = Aluno.criar("João Silva")
        assert isinstance(aluno.id, UUID)
        assert aluno.nome == "João Silva"

    def test_aluno_nome_vazio_levanta_erro(self) -> None:
        with pytest.raises(ValueError, match="não pode ser vazio"):
            Aluno(id=uuid4(), nome="")

    def test_aluno_nome_apenas_espacos_levanta_erro(self) -> None:
        with pytest.raises(ValueError, match="não pode ser vazio"):
            Aluno(id=uuid4(), nome="   ")

    def test_aluno_nome_strip(self) -> None:
        aluno = Aluno(id=uuid4(), nome="  João Silva  ")
        assert aluno.nome == "João Silva"


class TestDisciplinaAluno:
    def test_criar_disciplina(self, aluno_exemplo: Aluno) -> None:
        pesos = Pesos.padrao()
        disc = DisciplinaAluno(aluno_id=aluno_exemplo.id, nome="Matemática", pesos=pesos)
        assert disc.nome == "Matemática"
        assert disc.pesos == pesos

    def test_disciplina_nome_vazio_levanta_erro(self, aluno_exemplo: Aluno) -> None:
        with pytest.raises(ValueError, match="não pode ser vazio"):
            DisciplinaAluno(aluno_id=aluno_exemplo.id, nome="", pesos=Pesos.padrao())


class TestNotas:
    def test_criar_notas_validas(self, aluno_exemplo: Aluno) -> None:
        notas = Notas(
            aluno_id=aluno_exemplo.id,
            disciplina="Matemática",
            av1=8.0,
            av2=7.5,
            av3=9.0,
        )
        assert notas.av1 == 8.0
        assert notas.av2 == 7.5
        assert notas.av3 == 9.0

    def test_notas_arredondamento_duas_casas(self, aluno_exemplo: Aluno) -> None:
        notas = Notas(
            aluno_id=aluno_exemplo.id,
            disciplina="Matemática",
            av1=8.123,
            av2=7.567,
            av3=9.999,
        )
        assert notas.av1 == 8.12
        assert notas.av2 == 7.57
        assert notas.av3 == 10.0

    def test_nota_abaixo_zero_levanta_erro(self, aluno_exemplo: Aluno) -> None:
        with pytest.raises(ValueError, match="entre 0.00 e 10.00"):
            Notas(aluno_id=aluno_exemplo.id, disciplina="Matemática", av1=-1, av2=5, av3=5)

    def test_nota_acima_dez_levanta_erro(self, aluno_exemplo: Aluno) -> None:
        with pytest.raises(ValueError, match="entre 0.00 e 10.00"):
            Notas(aluno_id=aluno_exemplo.id, disciplina="Matemática", av1=10.01, av2=5, av3=5)

    def test_nota_tipo_invalido_levanta_erro(self, aluno_exemplo: Aluno) -> None:
        with pytest.raises(TypeError, match="numéricas"):
            Notas(aluno_id=aluno_exemplo.id, disciplina="Matemática", av1="oito", av2=5, av3=5)


class TestSituacao:
    def test_valores_enum(self) -> None:
        assert Situacao.APROVADO.value == "Aprovado"
        assert Situacao.EXAME.value == "Exame"
        assert Situacao.REPROVADO.value == "Reprovado"

    def test_comparacao(self) -> None:
        assert Situacao.APROVADO == Situacao.APROVADO
        assert Situacao.EXAME != Situacao.REPROVADO