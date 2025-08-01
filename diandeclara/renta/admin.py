from django.contrib import admin
from .models import DeclaracionRenta, PagoDeclaracion

@admin.register(DeclaracionRenta)
class DeclaracionRentaAdmin(admin.ModelAdmin):
    list_display = ['id', 'usuario', 'estado', 'es_residente', 'formulario_tipo', 'fecha_creacion']
    list_filter = ['estado', 'es_residente', 'formulario_tipo']
    search_fields = ['usuario__username', 'nit', 'primer_nombre', 'primer_apellido']

@admin.register(PagoDeclaracion)
class PagoDeclaracionAdmin(admin.ModelAdmin):
    list_display = ['referencia_pago', 'declaracion', 'valor_pagado', 'estado', 'fecha_pago']
    list_filter = ['estado']
    search_fields = ['referencia_pago']
