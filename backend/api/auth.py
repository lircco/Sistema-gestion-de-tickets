from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

Usuario = get_user_model()

class CustomAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        user = super().authenticate(request, username=username, password=password, **kwargs)
        if user:
            return user

        if username and '@' in username:
            user_by_email = Usuario.objects.filter(email__iexact=username).first()
            if user_by_email and user_by_email.check_password(password) and self.user_can_authenticate(user_by_email):
                return user_by_email
        
        if username and ' ' in username:
            parts = username.split(' ', 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ''
            
            users = Usuario.objects.filter(first_name__iexact=first_name, last_name__iexact=last_name)
            for u in users:
                # Igual que el login por username: un usuario inactivo no entra.
                if u.check_password(password) and self.user_can_authenticate(u):
                    return u
        return None
