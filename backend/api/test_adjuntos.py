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


@override_settings(MEDIA_ROOT=MEDIA_TEMPORAL)
class DescargaAdjuntoTests(APITestCase):
    def setUp(self):
        area = Area.objects.create(nombre="Soporte")
        otra_area = Area.objects.create(nombre="Alumnado")
        categoria = Categoria.objects.create(nombre="General")
        self.alumno = Usuario.objects.create_user(username="alumno", password="x")
        self.otro_alumno = Usuario.objects.create_user(username="otro", password="x")
        self.staff_area = Usuario.objects.create_user(username="s1", password="x", rol=Usuario.Roles.STAFF, area=area)
        self.staff_otra = Usuario.objects.create_user(username="s2", password="x", rol=Usuario.Roles.STAFF, area=otra_area)
        self.ticket = Ticket.objects.create(
            titulo="t", descripcion="d", creado_por=self.alumno, area_responsable=area, categoria=categoria,
            archivo_adjunto=SimpleUploadedFile("captura.png", PNG_1x1, content_type="image/png"),
        )
        self.sin_adjunto = Ticket.objects.create(
            titulo="t2", descripcion="d", creado_por=self.alumno, area_responsable=area, categoria=categoria,
        )
        self.url = reverse("ticket-adjunto", args=[self.ticket.id])

    def _get(self, usuario, url=None):
        self.client.force_authenticate(usuario)
        return self.client.get(url or self.url)

    def test_el_creador_descarga_su_adjunto(self):
        response = self._get(self.alumno)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "image/png")
        self.assertEqual(b"".join(response.streaming_content), PNG_1x1)

    def test_staff_del_area_puede_verlo(self):
        self.assertEqual(self._get(self.staff_area).status_code, status.HTTP_200_OK)

    def test_otro_alumno_o_staff_de_otra_area_no_pueden(self):
        self.assertEqual(self._get(self.otro_alumno).status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self._get(self.staff_otra).status_code, status.HTTP_404_NOT_FOUND)

    def test_anonimo_no_puede(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(self.url).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_ticket_sin_adjunto_devuelve_404(self):
        url = reverse("ticket-adjunto", args=[self.sin_adjunto.id])
        self.assertEqual(self._get(self.alumno, url).status_code, status.HTTP_404_NOT_FOUND)
