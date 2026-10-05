import subprocess
import sys
from pathlib import Path
from uuid import UUID

import pytest

from notas.models import Aluno, DisciplinaAluno, Notas, Pesos
from notas.storage import CSVStorage


def run_cli(*args: str, cwd: Path | None = None) -> subprocess.CompletedProcess:
    cmd = [sys.executable, "-m", "notas", *args]
    return subprocess.run(cmd, capture_output=True, text=True, cwd=cwd)


class TestCLI:
    def test_help(self) -> None:
        result = run_cli("--help")
        assert result.returncode == 0
        assert "CLI de notas" in result.stdout

    def test_aluno_cadastrar(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "notas.csv"
        import notas.storage
        original = notas.storage.CSVStorage.__init__

        def mock_init(self, caminho):
            original(self, csv_path)

        notas.storage.CSVStorage.__init__ = mock_init
        try:
            result = run_cli("aluno", "cadastrar", "João Silva", cwd=tmp_path)
            assert result.returncode == 0
            assert "Aluno cadastrado com ID:" in result.stdout
        finally:
            notas.storage.CSVStorage.__init__ = original

    def test_fluxo_completo_e2e(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "notas.csv"
        import notas.storage
        original = notas.storage.CSVStorage.__init__

        def mock_init(self, caminho):
            original(self, csv_path)

        notas.storage.CSVStorage.__init__ = mock_init
        try:
            result = run_cli("aluno", "cadastrar", "João Silva", cwd=tmp_path)
            assert result.returncode == 0
            output = result.stdout.strip()
            aluno_id = output.split(": ")[1]
            UUID(aluno_id)

            result = run_cli(
                "disciplina", "adicionar", aluno_id, "Matemática",
                "--peso1", "2", "--peso2", "3", "--peso3", "5",
                cwd=tmp_path
            )
            assert result.returncode == 0

            result = run_cli(
                "nota", "lancar", aluno_id, "Matemática",
                "--av1", "8.0", "--av2", "7.5", "--av3", "9.0",
                cwd=tmp_path
            )
            assert result.returncode == 0

            result = run_cli("media", aluno_id, "Matemática", cwd=tmp_path)
            assert result.returncode == 0
            assert "Média ponderada: 8.35" in result.stdout

            result = run_cli("situacao", aluno_id, "Matemática", cwd=tmp_path)
            assert result.returncode == 0
            assert "Situação: Aprovado" in result.stdout

            result = run_cli("boletim", aluno_id, cwd=tmp_path)
            assert result.returncode == 0
            assert "Boletim de João Silva" in result.stdout
            assert "Matemática: Média 8.35 - Aprovado" in result.stdout
        finally:
            notas.storage.CSVStorage.__init__ = original

    def test_aluno_nao_encontrado(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "notas.csv"
        import notas.storage
        original = notas.storage.CSVStorage.__init__

        def mock_init(self, caminho):
            original(self, csv_path)

        notas.storage.CSVStorage.__init__ = mock_init
        try:
            fake_id = "00000000-0000-0000-0000-000000000000"
            result = run_cli("media", fake_id, "Matemática", cwd=tmp_path)
            assert result.returncode == 0
            assert "não encontradas" in result.stderr
        finally:
            notas.storage.CSVStorage.__init__ = original

    def test_nota_invalida(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "notas.csv"
        import notas.storage
        original = notas.storage.CSVStorage.__init__

        def mock_init(self, caminho):
            original(self, csv_path)

        notas.storage.CSVStorage.__init__ = mock_init
        try:
            result = run_cli("aluno", "cadastrar", "Teste", cwd=tmp_path)
            aluno_id = result.stdout.strip().split(": ")[1]

            result = run_cli(
                "disciplina", "adicionar", aluno_id, "Matemática",
                cwd=tmp_path
            )
            assert result.returncode == 0

            result = run_cli(
                "nota", "lancar", aluno_id, "Matemática",
                "--av1", "11", "--av2", "7", "--av3", "8",
                cwd=tmp_path
            )
            assert result.returncode != 0
            assert "entre 0.00 e 10.00" in result.stderr or "ValueError" in result.stderr
        finally:
            notas.storage.CSVStorage.__init__ = original

    def test_config_pesos(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "notas.csv"
        import notas.storage
        import notas.config
        original_storage = notas.storage.CSVStorage.__init__
        original_config = notas.config.Config.CONFIG_DIR

        notas.config.Config.CONFIG_DIR = tmp_path / ".config" / "notas"

        def mock_init(self, caminho):
            original_storage(self, csv_path)

        notas.storage.CSVStorage.__init__ = mock_init
        try:
            result = run_cli("config-pesos", "--peso1", "3", "--peso2", "3", "--peso3", "4", cwd=tmp_path)
            assert result.returncode == 0
            assert "Pesos salvos: 3, 3, 4" in result.stdout

            result = run_cli("config-pesos", cwd=tmp_path)
            assert result.returncode == 0
            assert "Pesos atuais: 3, 3, 4" in result.stdout
        finally:
            notas.storage.CSVStorage.__init__ = original_storage
            notas.config.Config.CONFIG_DIR = original_config

    def test_editar_notas(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "notas.csv"
        import notas.storage
        original = notas.storage.CSVStorage.__init__

        def mock_init(self, caminho):
            original(self, csv_path)

        notas.storage.CSVStorage.__init__ = mock_init
        try:
            result = run_cli("aluno", "cadastrar", "Teste", cwd=tmp_path)
            aluno_id = result.stdout.strip().split(": ")[1]

            result = run_cli(
                "disciplina", "adicionar", aluno_id, "Matemática", cwd=tmp_path
            )
            assert result.returncode == 0

            result = run_cli(
                "nota", "lancar", aluno_id, "Matemática",
                "--av1", "5.0", "--av2", "5.0", "--av3", "5.0",
                cwd=tmp_path
            )
            assert result.returncode == 0

            result = run_cli(
                "nota", "editar", aluno_id, "Matemática",
                "--av1", "10.0",
                cwd=tmp_path
            )
            assert result.returncode == 0

            result = run_cli("media", aluno_id, "Matemática", cwd=tmp_path)
            assert result.returncode == 0
            assert "Média ponderada: 6.00" in result.stdout
        finally:
            notas.storage.CSVStorage.__init__ = original

    def test_multiplas_disciplinas(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "notas.csv"
        import notas.storage
        original = notas.storage.CSVStorage.__init__

        def mock_init(self, caminho):
            original(self, csv_path)

        notas.storage.CSVStorage.__init__ = mock_init
        try:
            result = run_cli("aluno", "cadastrar", "Maria", cwd=tmp_path)
            aluno_id = result.stdout.strip().split(": ")[1]

            result = run_cli("disciplina", "adicionar", aluno_id, "Matemática", cwd=tmp_path)
            assert result.returncode == 0
            result = run_cli("disciplina", "adicionar", aluno_id, "Física", cwd=tmp_path)
            assert result.returncode == 0

            result = run_cli(
                "nota", "lancar", aluno_id, "Matemática",
                "--av1", "8.0", "--av2", "7.0", "--av3", "9.0", cwd=tmp_path
            )
            assert result.returncode == 0
            result = run_cli(
                "nota", "lancar", aluno_id, "Física",
                "--av1", "6.0", "--av2", "7.0", "--av3", "8.0", cwd=tmp_path
            )
            assert result.returncode == 0

            result = run_cli("boletim", aluno_id, cwd=tmp_path)
            assert result.returncode == 0
            assert "Matemática: Média" in result.stdout
            assert "Física: Média" in result.stdout
        finally:
            notas.storage.CSVStorage.__init__ = original