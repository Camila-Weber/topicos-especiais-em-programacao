import json
from pathlib import Path
from notas.models import Pesos


class Config:
    CONFIG_DIR = Path.home() / ".config" / "notas"
    CONFIG_FILE = CONFIG_DIR / "config.json"

    PESOS_PADRAO = Pesos.padrao()

    @classmethod
    def _ensure_config_dir(cls) -> None:
        cls.CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    @classmethod
    def carregar(cls) -> Pesos:
        cls._ensure_config_dir()
        if not cls.CONFIG_FILE.exists():
            return cls.PESOS_PADRAO
        try:
            with open(cls.CONFIG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            return Pesos(
                peso1=data.get("peso1", cls.PESOS_PADRAO.peso1),
                peso2=data.get("peso2", cls.PESOS_PADRAO.peso2),
                peso3=data.get("peso3", cls.PESOS_PADRAO.peso3),
            )
        except (json.JSONDecodeError, KeyError, TypeError):
            return cls.PESOS_PADRAO

    @classmethod
    def salvar(cls, pesos: Pesos) -> None:
        cls._ensure_config_dir()
        data = {
            "peso1": pesos.peso1,
            "peso2": pesos.peso2,
            "peso3": pesos.peso3,
        }
        with open(cls.CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    @classmethod
    def resetar(cls) -> None:
        cls.salvar(cls.PESOS_PADRAO)