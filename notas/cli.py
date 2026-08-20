import argparse
import sys
from pathlib import Path
from uuid import UUID

from notas.config import Config
from notas.models import Aluno, DisciplinaAluno, Notas, Pesos
from notas.services import calcular_media, determinar_situacao
from notas.storage import CSVStorage


DATA_DIR = Path(__file__).parent.parent / "data"
CSV_PATH = DATA_DIR / "notas.csv"


def get_storage() -> CSVStorage:
    return CSVStorage(CSV_PATH)


def cmd_aluno_cadastrar(args: argparse.Namespace) -> int:
    storage = get_storage()
    aluno = Aluno.criar(args.nome)
    storage.cadastrar_aluno(aluno)
    print(f"Aluno cadastrado com ID: {aluno.id}")
    return 0


def cmd_aluno_listar(args: argparse.Namespace) -> int:
    storage = get_storage()
    alunos = storage.listar_alunos()
    if not alunos:
        print("Nenhum aluno cadastrado.")
        return 0
    for aluno in alunos:
        print(f"{aluno.id} - {aluno.nome}")
    return 0


def cmd_aluno_mostrar(args: argparse.Namespace) -> int:
    storage = get_storage()
    aluno_id = UUID(args.id)
    aluno = storage.buscar_aluno(aluno_id)
    if not aluno:
        print(f"Aluno {aluno_id} não encontrado.", file=sys.stderr)
        return 1
    print(f"ID: {aluno.id}")
    print(f"Nome: {aluno.nome}")
    return 0


def cmd_aluno_remover(args: argparse.Namespace) -> int:
    storage = get_storage()
    aluno_id = UUID(args.id)
    if storage.remover_aluno(aluno_id):
        print(f"Aluno {aluno_id} removido.")
        return 0
    print(f"Aluno {aluno_id} não encontrado.", file=sys.stderr)
    return 1


def cmd_disciplina_adicionar(args: argparse.Namespace) -> int:
    storage = get_storage()
    aluno_id = UUID(args.aluno_id)
    aluno = storage.buscar_aluno(aluno_id)
    if not aluno:
        print(f"Aluno {aluno_id} não encontrado.", file=sys.stderr)
        return 1
    pesos = Pesos(peso1=args.peso1, peso2=args.peso2, peso3=args.peso3)
    disciplina = DisciplinaAluno(aluno_id=aluno_id, nome=args.nome, pesos=pesos)
    try:
        storage.adicionar_disciplina(disciplina)
    except ValueError as e:
        print(str(e), file=sys.stderr)
        return 1
    print(f"Disciplina '{args.nome}' adicionada para aluno {aluno_id}.")
    return 0


def cmd_disciplina_listar(args: argparse.Namespace) -> int:
    storage = get_storage()
    aluno_id = UUID(args.aluno_id)
    disciplinas = storage.listar_disciplinas(aluno_id)
    if not disciplinas:
        print("Nenhuma disciplina cadastrada para este aluno.")
        return 0
    for d in disciplinas:
        print(f"{d.nome} (pesos: {d.pesos.peso1}, {d.pesos.peso2}, {d.pesos.peso3})")
    return 0


def cmd_disciplina_remover(args: argparse.Namespace) -> int:
    storage = get_storage()
    aluno_id = UUID(args.aluno_id)
    if storage.remover_disciplina(aluno_id, args.nome):
        print(f"Disciplina '{args.nome}' removida.")
        return 0
    print(f"Disciplina '{args.nome}' não encontrada para aluno {aluno_id}.", file=sys.stderr)
    return 1


def cmd_nota_lancar(args: argparse.Namespace) -> int:
    storage = get_storage()
    aluno_id = UUID(args.aluno_id)
    notas = Notas(
        aluno_id=aluno_id,
        disciplina=args.disciplina,
        av1=args.av1,
        av2=args.av2,
        av3=args.av3,
    )
    try:
        storage.lancar_notas(notas)
    except ValueError as e:
        print(str(e), file=sys.stderr)
        return 1
    print(f"Notas lançadas para {args.disciplina} do aluno {aluno_id}.")
    return 0


def cmd_nota_editar(args: argparse.Namespace) -> int:
    storage = get_storage()
    aluno_id = UUID(args.aluno_id)
    kwargs = {}
    if args.av1 is not None:
        kwargs["av1"] = args.av1
    if args.av2 is not None:
        kwargs["av2"] = args.av2
    if args.av3 is not None:
        kwargs["av3"] = args.av3
    if not kwargs:
        print("Nenhuma nota informada para edição.", file=sys.stderr)
        return 1
    try:
        storage.atualizar_notas(aluno_id, args.disciplina, **kwargs)
    except ValueError as e:
        print(str(e), file=sys.stderr)
        return 1
    print(f"Notas atualizadas para {args.disciplina} do aluno {aluno_id}.")
    return 0


def cmd_nota_remover(args: argparse.Namespace) -> int:
    storage = get_storage()
    aluno_id = UUID(args.aluno_id)
    if storage.remover_notas(aluno_id, args.disciplina):
        print(f"Notas removidas para {args.disciplina} do aluno {aluno_id}.")
        return 0
    print(f"Notas não encontradas para {args.disciplina} do aluno {aluno_id}.", file=sys.stderr)
    return 1


def cmd_media(args: argparse.Namespace) -> int:
    storage = get_storage()
    aluno_id = UUID(args.aluno_id)
    notas = storage.buscar_notas(aluno_id, args.disciplina)
    if not notas:
        print(f"Notas não encontradas para {args.disciplina} do aluno {aluno_id}.", file=sys.stderr)
        return 1
    disciplina = storage.buscar_disciplina(aluno_id, args.disciplina)
    if not disciplina:
        print(f"Disciplina '{args.disciplina}' não encontrada.", file=sys.stderr)
        return 1
    media = calcular_media(notas, disciplina.pesos)
    print(f"Média ponderada: {media:.2f}")
    return 0


def cmd_situacao(args: argparse.Namespace) -> int:
    storage = get_storage()
    aluno_id = UUID(args.aluno_id)
    notas = storage.buscar_notas(aluno_id, args.disciplina)
    if not notas:
        print(f"Notas não encontradas para {args.disciplina} do aluno {aluno_id}.", file=sys.stderr)
        return 1
    disciplina = storage.buscar_disciplina(aluno_id, args.disciplina)
    if not disciplina:
        print(f"Disciplina '{args.disciplina}' não encontrada.", file=sys.stderr)
        return 1
    media = calcular_media(notas, disciplina.pesos)
    situacao = determinar_situacao(media)
    print(f"Situação: {situacao.value} (média: {media:.2f})")
    return 0


def cmd_boletim(args: argparse.Namespace) -> int:
    storage = get_storage()
    aluno_id = UUID(args.aluno_id)
    aluno = storage.buscar_aluno(aluno_id)
    if not aluno:
        print(f"Aluno {aluno_id} não encontrado.", file=sys.stderr)
        return 1
    disciplinas = storage.listar_disciplinas(aluno_id)
    if not disciplinas:
        print("Nenhuma disciplina cadastrada para este aluno.")
        return 0
    print(f"Boletim de {aluno.nome} ({aluno_id})")
    print("-" * 50)
    for d in disciplinas:
        notas = storage.buscar_notas(aluno_id, d.nome)
        if notas:
            media = calcular_media(notas, d.pesos)
            situacao = determinar_situacao(media)
            print(f"{d.nome}: Média {media:.2f} - {situacao.value}")
        else:
            print(f"{d.nome}: Sem notas lançadas")
    return 0


def cmd_config_pesos(args: argparse.Namespace) -> int:
    if args.peso1 is None and args.peso2 is None and args.peso3 is None:
        pesos = Config.carregar()
        print(f"Pesos atuais: {pesos.peso1}, {pesos.peso2}, {pesos.peso3}")
        return 0
    pesos = Pesos(
        peso1=args.peso1 if args.peso1 is not None else Config.PESOS_PADRAO.peso1,
        peso2=args.peso2 if args.peso2 is not None else Config.PESOS_PADRAO.peso2,
        peso3=args.peso3 if args.peso3 is not None else Config.PESOS_PADRAO.peso3,
    )
    Config.salvar(pesos)
    print(f"Pesos salvos: {pesos.peso1}, {pesos.peso2}, {pesos.peso3}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="notas",
        description="CLI de notas: cadastro, lançamentos, média ponderada e situação",
    )
    subparsers = parser.add_subparsers(dest="comando", required=True)

    # aluno
    p_aluno = subparsers.add_parser("aluno", help="Gerenciar alunos")
    aluno_sub = p_aluno.add_subparsers(dest="aluno_comando", required=True)

    p_cad = aluno_sub.add_parser("cadastrar", help="Cadastrar novo aluno")
    p_cad.add_argument("nome", help="Nome do aluno")
    p_cad.set_defaults(func=cmd_aluno_cadastrar)

    p_lst = aluno_sub.add_parser("listar", help="Listar todos os alunos")
    p_lst.set_defaults(func=cmd_aluno_listar)

    p_mos = aluno_sub.add_parser("mostrar", help="Mostrar detalhes de um aluno")
    p_mos.add_argument("id", help="ID do aluno (UUID)")
    p_mos.set_defaults(func=cmd_aluno_mostrar)

    p_rem = aluno_sub.add_parser("remover", help="Remover aluno")
    p_rem.add_argument("id", help="ID do aluno (UUID)")
    p_rem.set_defaults(func=cmd_aluno_remover)

    # disciplina
    p_disc = subparsers.add_parser("disciplina", help="Gerenciar disciplinas do aluno")
    disc_sub = p_disc.add_subparsers(dest="disciplina_comando", required=True)

    p_disc_add = disc_sub.add_parser("adicionar", help="Adicionar disciplina ao aluno")
    p_disc_add.add_argument("aluno_id", help="ID do aluno (UUID)")
    p_disc_add.add_argument("nome", help="Nome da disciplina")
    p_disc_add.add_argument("--peso1", type=int, default=2, help="Peso da AV1 (padrão: 2)")
    p_disc_add.add_argument("--peso2", type=int, default=3, help="Peso da AV2 (padrão: 3)")
    p_disc_add.add_argument("--peso3", type=int, default=5, help="Peso da AV3 (padrão: 5)")
    p_disc_add.set_defaults(func=cmd_disciplina_adicionar)

    p_disc_lst = disc_sub.add_parser("listar", help="Listar disciplinas do aluno")
    p_disc_lst.add_argument("aluno_id", help="ID do aluno (UUID)")
    p_disc_lst.set_defaults(func=cmd_disciplina_listar)

    p_disc_rem = disc_sub.add_parser("remover", help="Remover disciplina do aluno")
    p_disc_rem.add_argument("aluno_id", help="ID do aluno (UUID)")
    p_disc_rem.add_argument("nome", help="Nome da disciplina")
    p_disc_rem.set_defaults(func=cmd_disciplina_remover)

    # nota
    p_nota = subparsers.add_parser("nota", help="Gerenciar notas")
    nota_sub = p_nota.add_subparsers(dest="nota_comando", required=True)

    p_nota_lan = nota_sub.add_parser("lancar", help="Lançar 3 avaliações")
    p_nota_lan.add_argument("aluno_id", help="ID do aluno (UUID)")
    p_nota_lan.add_argument("disciplina", help="Nome da disciplina")
    p_nota_lan.add_argument("--av1", type=float, required=True, help="Nota AV1 (0-10)")
    p_nota_lan.add_argument("--av2", type=float, required=True, help="Nota AV2 (0-10)")
    p_nota_lan.add_argument("--av3", type=float, required=True, help="Nota AV3 (0-10)")
    p_nota_lan.set_defaults(func=cmd_nota_lancar)

    p_nota_edi = nota_sub.add_parser("editar", help="Editar notas existentes")
    p_nota_edi.add_argument("aluno_id", help="ID do aluno (UUID)")
    p_nota_edi.add_argument("disciplina", help="Nome da disciplina")
    p_nota_edi.add_argument("--av1", type=float, help="Nova nota AV1 (0-10)")
    p_nota_edi.add_argument("--av2", type=float, help="Nova nota AV2 (0-10)")
    p_nota_edi.add_argument("--av3", type=float, help="Nova nota AV3 (0-10)")
    p_nota_edi.set_defaults(func=cmd_nota_editar)

    p_nota_rem = nota_sub.add_parser("remover", help="Remover notas de uma disciplina")
    p_nota_rem.add_argument("aluno_id", help="ID do aluno (UUID)")
    p_nota_rem.add_argument("disciplina", help="Nome da disciplina")
    p_nota_rem.set_defaults(func=cmd_nota_remover)

    # media
    p_media = subparsers.add_parser("media", help="Calcular média ponderada")
    p_media.add_argument("aluno_id", help="ID do aluno (UUID)")
    p_media.add_argument("disciplina", help="Nome da disciplina")
    p_media.set_defaults(func=cmd_media)

    # situacao
    p_sit = subparsers.add_parser("situacao", help="Verificar situação do aluno")
    p_sit.add_argument("aluno_id", help="ID do aluno (UUID)")
    p_sit.add_argument("disciplina", help="Nome da disciplina")
    p_sit.set_defaults(func=cmd_situacao)

    # boletim
    p_bol = subparsers.add_parser("boletim", help="Exibir boletim completo do aluno")
    p_bol.add_argument("aluno_id", help="ID do aluno (UUID)")
    p_bol.set_defaults(func=cmd_boletim)

    # config-pesos
    p_cfg = subparsers.add_parser("config-pesos", help="Configurar pesos padrão global")
    p_cfg.add_argument("--peso1", type=int, help="Peso da AV1")
    p_cfg.add_argument("--peso2", type=int, help="Peso da AV2")
    p_cfg.add_argument("--peso3", type=int, help="Peso da AV3")
    p_cfg.set_defaults(func=cmd_config_pesos)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())