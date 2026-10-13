import shutil
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Area, Categoria, Ticket, Usuario

MEDIA_TEMPORAL = tempfile.mkdtemp()
PNG_1x1 = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
    b"\x00\x00\x00\rIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
)


@override_settings(MEDIA_ROOT=MEDIA_TEMPORAL)
class AdjuntosTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_TEMPORAL, ignore_errors=True)

    def setUp(self):
        self.area = Area.objects.create(nombre="Soporte")
        self.categoria = Categoria.objects.create(nombre="General")
        self.alumno = Usuario.objects.create_user(username="alumno", password="x")
        self.otro_alumno = Usuario.objects.create_user(username="otro", password="x")
        self.client.force_authenticate(self.alumno)

    def _crear(self, archivo):
        return self.client.post(reverse("ticket-list"), {
            "titulo": "Con adjunto",
            "descripcion": "d",
            "area_responsable": self.area.id,
            "categoria": self.categoria.id,
            "archivo_adjunto": archivo,
        }, format="multipart")

    def test_acepta_una_imagen(self):
        response = self._crear(SimpleUploadedFile("captura.png", PNG_1x1, content_type="image/png"))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_rechaza_extensiones_no_permitidas(self):
        for nombre in ("script.html", "imagen.svg", "programa.exe"):
            response = self._crear(SimpleUploadedFile(nombre, b"<script>alert(1)</script>"))
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, nombre)
            self.assertIn("archivo_adjunto", response.data)

    def test_rechaza_archivos_de_mas_de_5_mb(self):
        grande = SimpleUploadedFile("grande.pdf", b"0" * (5 * 1024 * 1024 + 1), content_type="application/pdf")
        response = self._crear(grande)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("archivo_adjunto", response.data)
