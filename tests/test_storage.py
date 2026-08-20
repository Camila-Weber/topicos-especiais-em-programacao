import pytest
from uuid import uuid4

from notas.models import Aluno, DisciplinaAluno, Notas, Pesos
from notas.storage import CSVStorage


class TestStorageAluno:
    def test_cadastrar_e_buscar_aluno(self, storage_vazio: CSVStorage, aluno_exemplo: Aluno) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        encontrado = storage_vazio.buscar_aluno(aluno_exemplo.id)
        assert encontrado is not None
        assert encontrado.id == aluno_exemplo.id
        assert encontrado.nome == aluno_exemplo.nome

    def test_cadastrar_aluno_duplicado_levanta_erro(
        self, storage_vazio: CSVStorage, aluno_exemplo: Aluno
    ) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        with pytest.raises(ValueError, match="já existe"):
            storage_vazio.cadastrar_aluno(aluno_exemplo)

    def test_buscar_aluno_inexistente_retorna_none(self, storage_vazio: CSVStorage) -> None:
        resultado = storage_vazio.buscar_aluno(uuid4())
        assert resultado is None

    def test_listar_alunos(self, storage_vazio: CSVStorage) -> None:
        a1 = Aluno.criar("João")
        a2 = Aluno.criar("Maria")
        storage_vazio.cadastrar_aluno(a1)
        storage_vazio.cadastrar_aluno(a2)
        alunos = storage_vazio.listar_alunos()
        assert len(alunos) == 2
        nomes = {a.nome for a in alunos}
        assert nomes == {"João", "Maria"}

    def test_remover_aluno_existente(self, storage_vazio: CSVStorage, aluno_exemplo: Aluno) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        assert storage_vazio.remover_aluno(aluno_exemplo.id) is True
        assert storage_vazio.buscar_aluno(aluno_exemplo.id) is None

    def test_remover_aluno_inexistente_retorna_false(self, storage_vazio: CSVStorage) -> None:
        assert storage_vazio.remover_aluno(uuid4()) is False


class TestStorageDisciplina:
    def test_adicionar_disciplina(
        self, storage_vazio: CSVStorage, aluno_exemplo: Aluno, pesos_padrao: Pesos
    ) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        disc = DisciplinaAluno(aluno_id=aluno_exemplo.id, nome="Matemática", pesos=pesos_padrao)
        storage_vazio.adicionar_disciplina(disc)
        disciplinas = storage_vazio.listar_disciplinas(aluno_exemplo.id)
        assert len(disciplinas) == 1
        assert disciplinas[0].nome == "Matemática"

    def test_adicionar_disciplina_aluno_inexistente_levanta_erro(
        self, storage_vazio: CSVStorage, pesos_padrao: Pesos
    ) -> None:
        disc = DisciplinaAluno(aluno_id=uuid4(), nome="Matemática", pesos=pesos_padrao)
        with pytest.raises(ValueError, match="não encontrado"):
            storage_vazio.adicionar_disciplina(disc)

    def test_adicionar_disciplina_duplicada_levanta_erro(
        self, storage_vazio: CSVStorage, aluno_exemplo: Aluno, pesos_padrao: Pesos
    ) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        disc = DisciplinaAluno(aluno_id=aluno_exemplo.id, nome="Matemática", pesos=pesos_padrao)
        storage_vazio.adicionar_disciplina(disc)
        with pytest.raises(ValueError, match="já existe"):
            storage_vazio.adicionar_disciplina(disc)

    def test_listar_disciplinas_vazio(self, storage_vazio: CSVStorage, aluno_exemplo: Aluno) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        disciplinas = storage_vazio.listar_disciplinas(aluno_exemplo.id)
        assert disciplinas == []

    def test_remover_disciplina_existente(
        self, storage_vazio: CSVStorage, aluno_exemplo: Aluno, pesos_padrao: Pesos
    ) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        disc = DisciplinaAluno(aluno_id=aluno_exemplo.id, nome="Matemática", pesos=pesos_padrao)
        storage_vazio.adicionar_disciplina(disc)
        assert storage_vazio.remover_disciplina(aluno_exemplo.id, "Matemática") is True
        assert storage_vazio.listar_disciplinas(aluno_exemplo.id) == []

    def test_remover_disciplina_inexistente_retorna_false(
        self, storage_vazio: CSVStorage, aluno_exemplo: Aluno
    ) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        assert storage_vazio.remover_disciplina(aluno_exemplo.id, "Inexistente") is False


class TestStorageNotas:
    def test_lancar_notas(
        self, storage_vazio: CSVStorage, aluno_exemplo: Aluno, pesos_padrao: Pesos
    ) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        disc = DisciplinaAluno(aluno_id=aluno_exemplo.id, nome="Matemática", pesos=pesos_padrao)
        storage_vazio.adicionar_disciplina(disc)
        notas = Notas(
            aluno_id=aluno_exemplo.id, disciplina="Matemática", av1=8.0, av2=7.5, av3=9.0
        )
        storage_vazio.lancar_notas(notas)
        encontradas = storage_vazio.buscar_notas(aluno_exemplo.id, "Matemática")
        assert encontradas is not None
        assert encontradas.av1 == 8.0
        assert encontradas.av2 == 7.5
        assert encontradas.av3 == 9.0

    def test_lancar_notas_duplicado_levanta_erro(
        self, storage_vazio: CSVStorage, aluno_exemplo: Aluno, pesos_padrao: Pesos, notas_exemplo: Notas
    ) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        disc = DisciplinaAluno(aluno_id=aluno_exemplo.id, nome="Matemática", pesos=pesos_padrao)
        storage_vazio.adicionar_disciplina(disc)
        storage_vazio.lancar_notas(notas_exemplo)
        with pytest.raises(ValueError, match="já lançadas"):
            storage_vazio.lancar_notas(notas_exemplo)

    def test_lancar_notas_disciplina_inexistente_levanta_erro(
        self, storage_vazio: CSVStorage, aluno_exemplo: Aluno, notas_exemplo: Notas
    ) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        with pytest.raises(ValueError, match="não encontrada"):
            storage_vazio.lancar_notas(notas_exemplo)

    def test_atualizar_notas(
        self, storage_vazio: CSVStorage, aluno_exemplo: Aluno, pesos_padrao: Pesos, notas_exemplo: Notas
    ) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        disc = DisciplinaAluno(aluno_id=aluno_exemplo.id, nome="Matemática", pesos=pesos_padrao)
        storage_vazio.adicionar_disciplina(disc)
        storage_vazio.lancar_notas(notas_exemplo)
        storage_vazio.atualizar_notas(aluno_exemplo.id, "Matemática", av1=9.0)
        atualizadas = storage_vazio.buscar_notas(aluno_exemplo.id, "Matemática")
        assert atualizadas is not None
        assert atualizadas.av1 == 9.0
        assert atualizadas.av2 == 7.5
        assert atualizadas.av3 == 9.0

    def test_atualizar_notas_invalidas_levanta_erro(
        self, storage_vazio: CSVStorage, aluno_exemplo: Aluno, pesos_padrao: Pesos, notas_exemplo: Notas
    ) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        disc = DisciplinaAluno(aluno_id=aluno_exemplo.id, nome="Matemática", pesos=pesos_padrao)
        storage_vazio.adicionar_disciplina(disc)
        storage_vazio.lancar_notas(notas_exemplo)
        with pytest.raises(ValueError, match="entre 0.00 e 10.00"):
            storage_vazio.atualizar_notas(aluno_exemplo.id, "Matemática", av1=11.0)

    def test_remover_notas(
        self, storage_vazio: CSVStorage, aluno_exemplo: Aluno, pesos_padrao: Pesos, notas_exemplo: Notas
    ) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        disc = DisciplinaAluno(aluno_id=aluno_exemplo.id, nome="Matemática", pesos=pesos_padrao)
        storage_vazio.adicionar_disciplina(disc)
        storage_vazio.lancar_notas(notas_exemplo)
        assert storage_vazio.remover_notas(aluno_exemplo.id, "Matemática") is True
        assert storage_vazio.buscar_notas(aluno_exemplo.id, "Matemática") is None

    def test_remover_notas_inexistentes_retorna_false(
        self, storage_vazio: CSVStorage, aluno_exemplo: Aluno
    ) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        assert storage_vazio.remover_notas(aluno_exemplo.id, "Inexistente") is False

    def test_indice_unico_aluno_disciplina(
        self, storage_vazio: CSVStorage, aluno_exemplo: Aluno, pesos_padrao: Pesos
    ) -> None:
        storage_vazio.cadastrar_aluno(aluno_exemplo)
        disc1 = DisciplinaAluno(aluno_id=aluno_exemplo.id, nome="Matemática", pesos=pesos_padrao)
        disc2 = DisciplinaAluno(aluno_id=aluno_exemplo.id, nome="Física", pesos=pesos_padrao)
        storage_vazio.adicionar_disciplina(disc1)
        storage_vazio.adicionar_disciplina(disc2)
        disciplinas = storage_vazio.listar_disciplinas(aluno_exemplo.id)
        assert len(disciplinas) == 2
        nomes = {d.nome for d in disciplinas}
        assert nomes == {"Matemática", "Física"}