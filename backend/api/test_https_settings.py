import os
import subprocess
import sys
from pathlib import Path

from django.test import SimpleTestCase

BACKEND_DIR = Path(__file__).resolve().parent.parent
LEER_AJUSTES = (
    "import django; from django.conf import settings as s; "
    "print(getattr(s, 'SECURE_PROXY_SSL_HEADER', None), s.SESSION_COOKIE_SECURE, "
    "s.CSRF_COOKIE_SECURE, s.SECURE_HSTS_SECONDS)"
)


def ajustes_con(**variables):
    """Carga settings en un proceso aparte con las variables de entorno dadas."""
    env = {**os.environ, "DJANGO_SETTINGS_MODULE": "config.settings", "DJANGO_SECRET_KEY": "x"}
    env.pop("DJANGO_HTTPS", None)
    env.pop("DJANGO_HSTS_SECONDS", None)
    env.update(variables)
    salida = subprocess.run(
        [sys.executable, "-c", LEER_AJUSTES], cwd=BACKEND_DIR, env=env,
        capture_output=True, text=True, check=True,
    )
    return salida.stdout.strip()


class AjustesHttpsTests(SimpleTestCase):
    def test_apagado_por_defecto(self):
        self.assertEqual(ajustes_con(), "None False False 0")

    def test_activado_con_django_https(self):
        self.assertEqual(
            ajustes_con(DJANGO_HTTPS="True", DJANGO_HSTS_SECONDS="3600"),
            "('HTTP_X_FORWARDED_PROTO', 'https') True True 3600",
        )
