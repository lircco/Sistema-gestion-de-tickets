from django.apps import AppConfig

class ApiConfig(AppConfig):
    # Define el tipo de campo primario por defecto para los modelos de esta app
    default_auto_field = 'django.db.models.BigAutoField'
    
    name = 'api'

    def ready(self):
        import api.models  # This imports and registers the signals
        import api.signals