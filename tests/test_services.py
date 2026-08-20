import pytest
from uuid import uuid4

from notas.models import Notas, Pesos, Situacao
from notas.services import calcular_media, determinar_situacao


class TestCalcularMedia:
    def test_media_ponderada_pesos_padrao(self) -> None:
        notas = Notas(
            aluno_id=uuid4(),
            disciplina="Matemática",
            av1=8.0,
            av2=7.0,
            av3=9.0,
        )
        pesos = Pesos.padrao()
        media = calcular_media(notas, pesos)
        assert media == 8.2

    def test_media_ponderada_pesos_iguais(self) -> None:
        notas = Notas(
            aluno_id=uuid4(),
            disciplina="Matemática",
            av1=8.0,
            av2=7.0,
            av3=9.0,
        )
        pesos = Pesos(peso1=1, peso2=1, peso3=1)
        media = calcular_media(notas, pesos)
        assert media == 8.0

    def test_media_ponderada_pesos_diferentes(self) -> None:
        notas = Notas(
            aluno_id=uuid4(),
            disciplina="Matemática",
            av1=10.0,
            av2=5.0,
            av3=5.0,
        )
        pesos = Pesos(peso1=5, peso2=3, peso3=2)
        media = calcular_media(notas, pesos)
        assert media == 7.5

    def test_media_precisao_duas_casas(self) -> None:
        notas = Notas(
            aluno_id=uuid4(),
            disciplina="Matemática",
            av1=7.0,
            av2=7.0,
            av3=7.0,
        )
        pesos = Pesos(peso1=3, peso2=3, peso3=4)
        media = calcular_media(notas, pesos)
        assert media == 7.0

    def test_media_com_valores_decimais(self) -> None:
        notas = Notas(
            aluno_id=uuid4(),
            disciplina="Matemática",
            av1=7.5,
            av2=6.5,
            av3=8.0,
        )
        pesos = Pesos(peso1=2, peso2=3, peso3=5)
        media = calcular_media(notas, pesos)
        assert media == 7.45


class TestDeterminarSituacao:
    def test_aprovado_media_sete(self) -> None:
        assert determinar_situacao(7.0) == Situacao.APROVADO

    def test_aprovado_media_acima_sete(self) -> None:
        assert determinar_situacao(7.5) == Situacao.APROVADO
        assert determinar_situacao(10.0) == Situacao.APROVADO

    def test_exame_media_cinco(self) -> None:
        assert determinar_situacao(5.0) == Situacao.EXAME

    def test_exame_media_entre_cinco_e_sete(self) -> None:
        assert determinar_situacao(5.5) == Situacao.EXAME
        assert determinar_situacao(6.99) == Situacao.EXAME

    def test_reprovado_media_abaixo_cinco(self) -> None:
        assert determinar_situacao(4.99) == Situacao.REPROVADO
        assert determinar_situacao(0.0) == Situacao.REPROVADO

    def test_bordas_exatas(self) -> None:
        assert determinar_situacao(5.00) == Situacao.EXAME
        assert determinar_situacao(7.00) == Situacao.APROVADO
        assert determinar_situacao(4.99) == Situacao.REPROVADO
        assert determinar_situacao(6.99) == Situacao.EXAME


class TestIntegracaoMediaSituacao:
    def test_fluxo_completo_aprovado(self) -> None:
        notas = Notas(
            aluno_id=uuid4(),
            disciplina="Matemática",
            av1=8.0,
            av2=7.5,
            av3=9.0,
        )
        pesos = Pesos.padrao()
        media = calcular_media(notas, pesos)
        situacao = determinar_situacao(media)
        assert media == 8.35
        assert situacao == Situacao.APROVADO

    def test_fluxo_completo_exame(self) -> None:
        notas = Notas(
            aluno_id=uuid4(),
            disciplina="Matemática",
            av1=5.0,
            av2=6.0,
            av3=5.5,
        )
        pesos = Pesos.padrao()
        media = calcular_media(notas, pesos)
        situacao = determinar_situacao(media)
        assert media == 5.55
        assert situacao == Situacao.EXAME

    def test_fluxo_completo_reprovado(self) -> None:
        notas = Notas(
            aluno_id=uuid4(),
            disciplina="Matemática",
            av1=3.0,
            av2=4.0,
            av3=4.5,
        )
        pesos = Pesos.padrao()
        media = calcular_media(notas, pesos)
        situacao = determinar_situacao(media)
        assert media == 4.05
        assert situacao == Situacao.REPROVADO