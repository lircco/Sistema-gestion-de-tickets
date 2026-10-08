# --- REEMPLAZ TUS IMPORTS DE ARRIBA POR ESTOS ---



from rest_framework import viewsets, filters, permissions, status



from rest_framework.pagination import PageNumberPagination



from rest_framework.response import Response



from rest_framework.decorators import action



from rest_framework.views import APIView  # <-- SPER IMPORTANTE PARA TU NUEVA CLASE



from django.contrib.auth import authenticate, login, logout



from django.contrib.auth.password_validation import validate_password



from django.core.exceptions import ValidationError as DjangoValidationError



from django.db.models import Count



from django.db import models



from django.core.mail import send_mail



from django.conf import settings







from django.utils.crypto import get_random_string







from .models import Ticket, Usuario, Area, Categoria, Respuesta



from .serializers import TicketSerializer, RegistroSerializer, AreaSerializer, CategoriaSerializer, UsuarioSerializer, RespuestaSerializer



from .permissions import PuedeGestionarTicket







class RegistroUsuarioViewSet(viewsets.ModelViewSet):



    queryset = Usuario.objects.all()



    serializer_class = RegistroSerializer



    permission_classes = [permissions.AllowAny]







    def perform_create(self, serializer):



        user = serializer.save()



        if user.email:



            try:



                send_mail(



                    subject='Bienvenido al Sistema de Tickets de la UnRaf!',



                    message=f'Hola {user.first_name},\n\nTu cuenta ha sido creada exitosamente. Bienvenido a nuestra plataforma de soporte!\n\nSaludos,\nEl soporte tcnico de UnRaf.',



                    from_email=settings.DEFAULT_FROM_EMAIL,



                    recipient_list=[user.email],



                    fail_silently=True,



                )



            except Exception:



                pass











class StandardResultsSetPagination(PageNumberPagination):



    page_size = 10



    page_size_query_param = 'page_size'



    max_page_size = 100











class TicketViewSet(viewsets.ModelViewSet):



    serializer_class = TicketSerializer



    pagination_class = StandardResultsSetPagination



    permission_classes = [permissions.IsAuthenticated, PuedeGestionarTicket]



    filter_backends = [filters.SearchFilter]



    search_fields = ['titulo', 'descripcion', 'estado']







    def get_queryset(self):
        user = self.request.user
        from django.db.models import Q

        # Superusers can see all tickets
        if user.is_superuser:
            return Ticket.objects.all().order_by('-creado_el')

        if hasattr(user, 'rol') and user.rol in ['STAFF', 'SUPERVISOR'] or user.is_staff:
            area_id = getattr(user, 'area_id', None)
            if area_id:
                # Staff/Supervisor only sees tickets from their area, plus any they created themselves
                return Ticket.objects.filter(Q(area_responsable_id=area_id) | Q(creado_por=user)).order_by('-creado_el')
            else:
                # If they have no area assigned yet, maybe they shouldn't see other areas' tickets.
                return Ticket.objects.filter(creado_por=user).order_by('-creado_el')

        return Ticket.objects.filter(creado_por=user).order_by('-creado_el')







    def perform_create(self, serializer):



        serializer.save(creado_por=self.request.user)







    @action(detail=False, methods=['get'])



    def estadisticas(self, request):



        stats = Ticket.objects.aggregate(



            total=Count('id'),



            abiertos=Count('id', filter=models.Q(estado='ABIERTO')),



            en_progreso=Count('id', filter=models.Q(estado='EN_PROGRESO')),



            cerrados=Count('id', filter=models.Q(estado='CERRADO'))



        )



        return Response(stats)







    @action(detail=True, methods=['post'])



    def responder(self, request, pk=None):



        ticket = self.get_object()



        mensaje = (request.data.get('mensaje') or '').strip()







        if not mensaje:



            return Response({'error': 'El mensaje no puede estar vaco.'}, status=status.HTTP_400_BAD_REQUEST)







        respuesta = Respuesta.objects.create(ticket=ticket, autor=request.user, mensaje=mensaje)



        return Response(RespuestaSerializer(respuesta).data, status=status.HTTP_201_CREATED)











class AreaViewSet(viewsets.ReadOnlyModelViewSet):



    queryset = Area.objects.all()



    serializer_class = AreaSerializer



    permission_classes = [permissions.IsAuthenticated]











class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):



    queryset = Categoria.objects.all()



    serializer_class = CategoriaSerializer



    permission_classes = [permissions.IsAuthenticated]











class UsuarioActualView(APIView):



    permission_classes = [permissions.IsAuthenticated]







    def get(self, request):



        usuario = request.user



        data = {



            'id': usuario.id,



            'username': usuario.username,



            'email': usuario.email,



            'first_name': usuario.first_name,



            'rol': usuario.rol if hasattr(usuario, 'rol') else 'ESTUDIANTE',



            'is_staff': usuario.is_staff,



            'area': usuario.area_id if hasattr(usuario, 'area_id') else None



        }



        return Response(data)



    def patch(self, request):

        usuario = request.user

        area_id = request.data.get('area')

        if area_id is not None:

            usuario.area_id = area_id

            usuario.save()

        return Response({'message': 'Perfil actualizado'})











class LoginView(APIView):



    permission_classes = [permissions.AllowAny]







    def post(self, request):



        username = request.data.get('username')



        password = request.data.get('password')



        user = authenticate(username=username, password=password)



        if user:



            login(request, user)



            return Response(UsuarioSerializer(user).data)



        return Response({'error': 'Credenciales invlidas'}, status=status.HTTP_401_UNAUTHORIZED)











class LogoutView(APIView):



    permission_classes = [permissions.AllowAny]







    def post(self, request):



        logout(request)



        return Response({'message': 'Sesin cerrada correctamente'})











# --- VISTA DE RECUPERACION DE CONTRASEA ---



class RecuperarPasswordView(APIView):



    permission_classes = [permissions.AllowAny]







    def post(self, request):



        email = request.data.get('email')



        



        if not email:



            return Response({'error': 'Por favor, ingrese un correo electronico.'}, status=status.HTTP_400_BAD_REQUEST)



        



        try:



            usuario = Usuario.objects.get(email=email)



            



            nueva_clave = get_random_string(length=12)



            usuario.set_password(nueva_clave)



            usuario.save()







            # Configuramos el mensaje para Gmail



            asunto = 'Contrasea restablecida con xito - UnRafTickets'



            mensaje = (



                f'Hola {usuario.first_name or usuario.username},\n\n'



                f'Tu contrasea ha sido restablecida con xito para el sistema UnrafTickets.\n\n'



                f'Tu nueva contrasea temporal para ingresar es: {nueva_clave}\n\n'



                f'Por favor, inicia sesin y cmbiala desde tu perfil.\n\n'



                f'Saludos,\nSoporte Tcnico Institucional.'



            )



            email_desde = settings.EMAIL_HOST_USER



            emails_destino = [email]







            try:



                send_mail(asunto, mensaje, email_desde, emails_destino, fail_silently=False)



            except Exception:



                pass







        except Usuario.DoesNotExist:



            # Para evitar enumeracin de usuarios, devolvemos 200 con mensaje genrico



            pass







        return Response({'message': 'Si el correo electrnico est registrado, recibirs las instrucciones para restablecer tu contrasea.'}, status=status.HTTP_200_OK)











# --- VISTA DE CAMBIO DE CONTRASEA (desde el perfil, usuario ya logueado) ---



class CambiarPasswordView(APIView):



    permission_classes = [permissions.IsAuthenticated]







    def post(self, request):



        password_actual = request.data.get('password_actual')



        password_nueva = request.data.get('password_nueva')



        usuario = request.user







        if not password_actual or not password_nueva:



            return Response({'error': 'Debe ingresar la contrasea actual y la nueva.'}, status=status.HTTP_400_BAD_REQUEST)







        if not usuario.check_password(password_actual):



            return Response({'error': 'La contrasea actual es incorrecta.'}, status=status.HTTP_400_BAD_REQUEST)







        try:



            validate_password(password_nueva, user=usuario)



        except DjangoValidationError as e:



            return Response({'error': ' '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)







        usuario.set_password(password_nueva)



        usuario.save()







        if usuario.email:



            try:



                send_mail(



                    subject='Actualizacin de contrasea',



                    message=f'Hola {usuario.first_name},\n\nTe informamos que tu contrasea ha sido actualizada correctamente.\n\nSaludos,\nEl soporte tcnico de UnRaf.',



                    from_email=settings.DEFAULT_FROM_EMAIL,



                    recipient_list=[usuario.email],



                    fail_silently=True,



                )



            except Exception:



                pass







        return Response({'message': 'Contrasea actualizada correctamente.'}, status=status.HTTP_200_OK)











