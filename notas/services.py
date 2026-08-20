from notas.models import Notas, Pesos, Situacao


def calcular_media(notas: Notas, pesos: Pesos) -> float:
    soma_ponderada = (
        notas.av1 * pesos.peso1
        + notas.av2 * pesos.peso2
        + notas.av3 * pesos.peso3
    )
    media = soma_ponderada / pesos.soma
    return round(media, 2)


def determinar_situacao(media: float) -> Situacao:
    if media >= 7.0:
        return Situacao.APROVADO
    if media >= 5.0:
        return Situacao.EXAME
    return Situacao.REPROVADO