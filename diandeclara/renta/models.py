from django.db import models
from django.conf import settings

class DeclaracionRenta(models.Model):
    ESTADO_CHOICES = [
        ("borrador", "Borrador"),
        ("presentada", "Presentada"),
        ("pagada", "Pagada"),
    ]
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default="borrador")
    # Preguntas de residencia
    residencia_2024 = models.CharField(max_length=32, blank=True, null=True)
    residencia_365 = models.CharField(max_length=32, blank=True, null=True)
    nacionalidad_colombiana = models.CharField(max_length=8, blank=True, null=True)
    servicio_estado_exterior = models.CharField(max_length=8, blank=True, null=True)
    es_residente = models.BooleanField(default=False)
    formulario_tipo = models.CharField(max_length=8, blank=True, null=True)  # 210 o 110
    # Datos personales (simplificado)
    nit = models.CharField(max_length=20, blank=True, null=True)
    dv = models.CharField(max_length=2, blank=True, null=True)
    primer_apellido = models.CharField(max_length=64, blank=True, null=True)
    segundo_apellido = models.CharField(max_length=64, blank=True, null=True)
    primer_nombre = models.CharField(max_length=64, blank=True, null=True)
    otros_nombres = models.CharField(max_length=64, blank=True, null=True)
    genero = models.CharField(max_length=32, blank=True, null=True)
    direccion_seccional = models.CharField(max_length=8, blank=True, null=True)
    actividad_economica = models.CharField(max_length=64, blank=True, null=True)
    # Campos de simulación de valores
    patrimonio_bruto = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    deudas = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    ingresos_brutos = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    deducciones = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    renta_liquida = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    impuesto_calculado = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    saldo_a_pagar = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    saldo_a_favor = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    # Otros campos pueden agregarse según necesidad

    def __str__(self):
        return f"Declaración {self.pk} de {self.usuario}"
    
    def get_estado_display(self):
        estados = {'borrador': 'Borrador', 'presentada': 'Presentada', 'pagada': 'Pagada'}
        return estados.get(self.estado, self.estado)  

class PagoDeclaracion(models.Model):
    declaracion = models.OneToOneField(DeclaracionRenta, on_delete=models.CASCADE, related_name="pago")
    fecha_pago = models.DateTimeField(auto_now_add=True)
    referencia_pago = models.CharField(max_length=32)
    valor_pagado = models.DecimalField(max_digits=16, decimal_places=2)
    metodo_pago = models.CharField(max_length=20, choices=[('pse', 'PSE'), ('tarjeta', 'Tarjeta de Crédito')], default='pse')
    estado = models.CharField(max_length=16, default="exitoso")

    def __str__(self):
        return f"Pago {self.referencia_pago} - {self.estado}"

    def get_estado_display(self):
        estados = {'exitoso': 'Exitoso', 'pendiente': 'Pendiente', 'fallido': 'Fallido'}
        return estados.get(self.estado, self.estado)
