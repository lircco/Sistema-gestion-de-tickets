from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.models import Notificacion, Usuario


class EndpointNotificacionesTests(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(username="alumno", password="x")
        self.otro = Usuario.objects.create_user(username="otro", password="x")
        self.notif = Notificacion.objects.create(usuario=self.usuario, mensaje="Tu ticket fue cerrado")
        self.ajena = Notificacion.objects.create(usuario=self.otro, mensaje="Mensaje de otro")
        self.client.force_authenticate(self.usuario)
        self.url_lista = reverse("notificacion-list")
        self.url_detalle = reverse("notificacion-detail", args=[self.notif.id])

    def test_no_se_pueden_crear_notificaciones(self):
        response = self.client.post(self.url_lista, {"mensaje": "falsa"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertEqual(Notificacion.objects.count(), 2)

    def test_no_se_pueden_reemplazar_ni_borrar(self):
        self.assertEqual(self.client.put(self.url_detalle, {"leida": True}, format="json").status_code,
                         status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertEqual(self.client.delete(self.url_detalle).status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertTrue(Notificacion.objects.filter(id=self.notif.id).exists())

    def test_patch_solo_cambia_leida(self):
        response = self.client.patch(self.url_detalle, {"leida": True, "mensaje": "editado"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notif.refresh_from_db()
        self.assertTrue(self.notif.leida)
        self.assertEqual(self.notif.mensaje, "Tu ticket fue cerrado")

    def test_no_se_puede_tocar_una_notificacion_ajena(self):
        url = reverse("notificacion-detail", args=[self.ajena.id])
        self.assertEqual(self.client.patch(url, {"leida": True}, format="json").status_code, status.HTTP_404_NOT_FOUND)

    def test_marcar_todas_sigue_funcionando(self):
        response = self.client.post(reverse("notificacion-marcar-todas-leidas"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notif.refresh_from_db()
        self.assertTrue(self.notif.leida)
