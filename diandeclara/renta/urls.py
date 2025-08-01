from django.urls import path
from . import views

app_name = "renta"

urlpatterns = [
    path("", views.inicio_declaracion, name="inicio"),
    path("menu/", views.menu_principal, name="menu_principal"),
    path("residencia/", views.preguntas_residencia, name="preguntas_residencia"),
    path("formulario/", views.formulario_210, name="formulario_210"),
    path("resumen/", views.resumen_declaracion, name="resumen"),
    path("pago/", views.pago_declaracion, name="pago"),
    path("exito/", views.confirmacion, name="exito"),
    path("lista/", views.lista_declaraciones, name="lista_declaraciones"),
    path("pdf/<int:declaracion_id>/", views.descargar_pdf, name="descargar_pdf"),
    path("comprobante/<int:pago_id>/", views.descargar_comprobante, name="descargar_comprobante"),
]
