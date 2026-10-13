from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

Usuario = get_user_model()

class CustomAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        user = super().authenticate(request, username=username, password=password, **kwargs)
        if user:
            return user
        
        if username and ' ' in username:
            parts = username.split(' ', 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ''
            
            users = Usuario.objects.filter(first_name__iexact=first_name, last_name__iexact=last_name)
            for u in users:
                if u.check_password(password):
                    return u
        return None
