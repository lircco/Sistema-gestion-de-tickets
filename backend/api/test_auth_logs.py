import io
from contextlib import redirect_stdout, redirect_stderr

from django.contrib.auth import authenticate
from django.test import TestCase

from api.models import Usuario


class AutenticacionNoExponeCredencialesTests(TestCase):
    def setUp(self):
        Usuario.objects.create_user(
            username="alumno_logs",
            password="ClaveSecreta123!",
            first_name="Ana",
            last_name="Gomez",
        )

    def _autenticar_capturando_salida(self, username, password):
        salida = io.StringIO()
        with redirect_stdout(salida), redirect_stderr(salida):
            user = authenticate(username=username, password=password)
        return user, salida.getvalue()

    def test_login_por_username_no_imprime_la_contrasena(self):
        user, salida = self._autenticar_capturando_salida("alumno_logs", "ClaveSecreta123!")
        self.assertIsNotNone(user)
        self.assertNotIn("ClaveSecreta123!", salida)

    def test_login_por_nombre_no_imprime_la_contrasena(self):
        user, salida = self._autenticar_capturando_salida("Ana Gomez", "ClaveSecreta123!")
        self.assertIsNotNone(user)
        self.assertNotIn("ClaveSecreta123!", salida)

    def test_login_fallido_no_imprime_la_contrasena(self):
        user, salida = self._autenticar_capturando_salida("alumno_logs", "Incorrecta999!")
        self.assertIsNone(user)
        self.assertNotIn("Incorrecta999!", salida)
