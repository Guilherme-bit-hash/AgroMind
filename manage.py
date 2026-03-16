import os
import sys


def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.development")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Não foi possível importar o Django. Verifique se ele está "
            "instalado e se o ambiente virtual está ativado."
        ) from exc
    execute_from_command_line(sys.argv)


if _name_ == "_main_":
    main()