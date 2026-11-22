import shutil
import tempfile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Area, Categoria, Ticket, Usuario
from api.serializers import TicketSerializer

MEDIA_TEMPORAL = tempfile.mkdtemp()
PNG_1x1 = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
    b"\x00\x00\x00\rIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
)


@override_settings(MEDIA_ROOT=MEDIA_TEMPORAL)
class PerfilDniFotoTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_TEMPORAL, ignore_errors=True)

    def setUp(self):
        self.url_me = reverse("usuario-actual")
        self.usuario = Usuario.objects.create_user(
            username="estudiante1",
            password="Password123!",
            email="estudiante1@unraf.edu.ar",
            first_name="Juan",
            last_name="Perez",
            rol=Usuario.Roles.ESTUDIANTE,
        )
        self.client.force_authenticate(user=self.usuario)

    def test_obtener_perfil_con_dni_y_foto_inicial(self):
        response = self.client.get(self.url_me)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("dni", response.data)
        self.assertIn("foto_perfil", response.data)
        self.assertIsNone(response.data["dni"])
        self.assertIsNone(response.data["foto_perfil"])

    def test_guardar_dni_exitoso(self):
        response = self.client.patch(self.url_me, {"dni": "40123456"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.usuario.refresh_from_db()
        self.assertEqual(self.usuario.dni, "40123456")
        self.assertEqual(response.data["dni"], "40123456")

    def test_dni_inmutable_rechaza_modificacion(self):
        self.usuario.dni = "40123456"
        self.usuario.save(update_fields=["dni"])

        response = self.client.patch(self.url_me, {"dni": "45999888"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("El DNI ya fue registrado y no se puede modificar", response.data["error"])
        self.usuario.refresh_from_db()
        self.assertEqual(self.usuario.dni, "40123456")

    def test_dni_mismo_valor_no_falla(self):
        self.usuario.dni = "40123456"
        self.usuario.save(update_fields=["dni"])

        response = self.client.patch(self.url_me, {"dni": "40123456"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_dni_formato_invalido(self):
        for invalido in ("letras123", "123", "123456789012345", ""):
            response = self.client.patch(self.url_me, {"dni": invalido}, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, invalido)

    def test_dni_duplicado_rechaza(self):
        Usuario.objects.create_user(
            username="otro_estudiante",
            password="Password123!",
            dni="40123456"
        )
        response = self.client.patch(self.url_me, {"dni": "40123456"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Ya existe una cuenta registrada con este DNI", response.data["error"])

    def test_subir_foto_perfil_exitosa(self):
        foto = SimpleUploadedFile("perfil.png", PNG_1x1, content_type="image/png")
        response = self.client.patch(self.url_me, {"foto_perfil": foto}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.usuario.refresh_from_db()
        self.assertTrue(bool(self.usuario.foto_perfil))
        self.assertIn("perfil", self.usuario.foto_perfil.name)
        self.assertIsNotNone(response.data["foto_perfil"])

    def test_subir_foto_perfil_extension_invalida(self):
        archivo_invalido = SimpleUploadedFile("script.html", b"<html></html>", content_type="text/html")
        response = self.client.patch(self.url_me, {"foto_perfil": archivo_invalido}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_ticket_serializer_incluye_creado_por_dni(self):
        self.usuario.dni = "38765432"
        self.usuario.save(update_fields=["dni"])
        area = Area.objects.create(nombre="Tecnología")
        categoria = Categoria.objects.create(nombre="Hardware")
        ticket = Ticket.objects.create(
            titulo="Problema monitor",
            descripcion="No enciende la pantalla",
            creado_por=self.usuario,
            area_responsable=area,
            categoria=categoria,
        )
        serializer = TicketSerializer(ticket)
        self.assertEqual(serializer.data["creado_por_dni"], "38765432")
