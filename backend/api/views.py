# --- REEMPLAZ TUS IMPORTS DE ARRIBA POR ESTOS ---



from rest_framework import viewsets, mixins, filters, permissions, status



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







from django.contrib.auth.tokens import default_token_generator







from .models import Ticket, Usuario, Area, Categoria, Respuesta



from .serializers import TicketSerializer, RegistroSerializer, AreaSerializer, CategoriaSerializer, UsuarioSerializer, RespuestaSerializer



from .permissions import PuedeGestionarTicket







class RegistroUsuarioViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    # Solo alta de cuentas: listar, editar o borrar usuarios no es público.



    queryset = Usuario.objects.all()



    serializer_class = RegistroSerializer



    permission_classes = [permissions.AllowAny]







    def perform_create(self, serializer):



        user = serializer.save()



        if user.email:



            try:



                send_mail(



                    subject='Bienvenido al Sistema de Tickets de la UnRaf!',



                    message=f'Hola {user.first_name},\n\nTu cuenta ha sido creada exitosamente. Bienvenido a nuestra plataforma de soporte!\n\nSaludos,\nEl soporte técnico de UnRaf.',



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
    permission_classes = [permissions.AllowAny]











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
        
        if not user and username and ' ' in username:
            # Intentar login con nombre y apellido
            parts = username.split(' ', 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ''
            
            try:
                # Filtrar usuarios que coincidan y chequear password manualmente
                users = Usuario.objects.filter(first_name__iexact=first_name, last_name__iexact=last_name)
                for u in users:
                    if u.check_password(password):
                        user = u
                        break
            except Exception:
                pass

        if user:



            login(request, user)



            return Response(UsuarioSerializer(user).data)



        return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)











class LogoutView(APIView):



    permission_classes = [permissions.AllowAny]







    def post(self, request):



        logout(request)



        return Response({'message': 'Sesión cerrada correctamente'})











# --- VISTA DE RECUPERACION DE CONTRASEA ---



class RecuperarPasswordView(APIView):
    """
    Envía por mail un código de un solo uso para restablecer la contraseña.
    No modifica la contraseña actual: eso recién pasa en RestablecerPasswordView,
    con el código. El código vence a los PASSWORD_RESET_TIMEOUT segundos y deja de
    servir apenas la contraseña cambia.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Por favor, ingrese un correo electrónico.'}, status=status.HTTP_400_BAD_REQUEST)

        minutos_validez = settings.PASSWORD_RESET_TIMEOUT // 60
        email_desde = f'Sistema de Tickets Universidad <{settings.EMAIL_HOST_USER}>'
        for usuario in Usuario.objects.filter(email=email, is_active=True):
            codigo = default_token_generator.make_token(usuario)
            mensaje = (
                f'Hola {usuario.first_name or usuario.username},\n\n'
                f'Recibimos un pedido para restablecer tu contraseña en UnrafTickets.\n\n'
                f'Tu código de recuperación es:\n\n{codigo}\n\n'
                f'Copialo en la pantalla de recuperación junto con tu nueva contraseña. '
                f'El código vence en {minutos_validez} minutos y sirve una sola vez.\n\n'
                f'Si no pediste este cambio, ignorá este mensaje: tu contraseña actual sigue funcionando.\n\n'
                f'Saludos,\nSoporte Técnico Institucional.'
            )
            try:
                send_mail('Código para restablecer tu contraseña - UnRafTickets', mensaje, email_desde, [email], fail_silently=False)
            except Exception:
                pass

        # Para evitar enumeración de usuarios, la respuesta es la misma exista o no el email.
        return Response({'message': 'Si el correo electrónico está registrado, recibirás las instrucciones para restablecer tu contraseña.'}, status=status.HTTP_200_OK)


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













class RestablecerPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        codigo = request.data.get('codigo')
        nueva_password = request.data.get('nueva_password')

        if not all([email, codigo, nueva_password]):
            return Response({'error': 'Faltan datos obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        # Misma respuesta si el email no existe o si el código no coincide, para no
        # revelar qué emails están registrados. El email no es único: se prueban todas.
        usuario = next(
            (u for u in Usuario.objects.filter(email=email, is_active=True) if default_token_generator.check_token(u, codigo)),
            None,
        )
        if usuario is None:
            return Response({'error': 'El email o el código ingresado no son válidos, o el código venció.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(nueva_password, user=usuario)
        except DjangoValidationError as e:
            return Response({'error': ' '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        usuario.set_password(nueva_password)
        usuario.save()
        return Response({'mensaje': 'Contraseña actualizada correctamente.'}, status=status.HTTP_200_OK)
