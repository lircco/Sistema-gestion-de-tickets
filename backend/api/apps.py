from django.apps import AppConfig

class ApiConfig(AppConfig):
    # Define el tipo de campo primario por defecto para los modelos de esta app
    default_auto_field = 'django.db.models.BigAutoField'
    
    name = 'api'

    def ready(self):
        # Importamos las señales para que Django las escuche al arrancar
        import api.signals