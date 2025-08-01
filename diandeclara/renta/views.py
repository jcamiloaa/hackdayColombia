from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import DeclaracionRenta, PagoDeclaracion
from django.utils.crypto import get_random_string
from django.http import HttpResponse
import datetime

@login_required
def menu_principal(request):
    """Vista para mostrar el menú principal de declaración de renta"""
    return render(request, 'renta/menu_principal.html')

@login_required
def inicio_declaracion(request):
    # Ahora redirige al menú principal en lugar de directamente a preguntas
    return redirect('renta:menu_principal')

@login_required
def preguntas_residencia(request):
    declaracion, _ = DeclaracionRenta.objects.get_or_create(usuario=request.user, estado="borrador")
    if request.method == "POST":
        paso = request.POST.get('paso')
        # Paso 1
        if paso == "1":
            declaracion.residencia_2024 = request.POST.get('residencia_2024')
            if declaracion.residencia_2024 == "mayor":
                declaracion.es_residente = True
                declaracion.formulario_tipo = "210"
                declaracion.save()
                return redirect('renta:formulario_210')
            else:
                declaracion.save()
                return render(request, "renta/preguntas_residencia_2.html", {"declaracion": declaracion})
        # Paso 2
        elif paso == "2":
            declaracion.residencia_365 = request.POST.get('residencia_365')
            if declaracion.residencia_365 == "si":
                declaracion.es_residente = True
                declaracion.formulario_tipo = "210"
                declaracion.save()
                return redirect('renta:formulario_210')
            else:
                declaracion.save()
                return render(request, "renta/preguntas_residencia_3.html", {"declaracion": declaracion})
        # Paso 3
        elif paso == "3":
            declaracion.nacionalidad_colombiana = request.POST.get('nacionalidad_colombiana')
            if declaracion.nacionalidad_colombiana == "no":
                declaracion.es_residente = False
                declaracion.formulario_tipo = "110"
                declaracion.save()
                return render(request, "renta/no_residente.html", {"declaracion": declaracion})
            else:
                declaracion.save()
                return render(request, "renta/preguntas_residencia_4.html", {"declaracion": declaracion})
        # Paso 4
        elif paso == "4":
            declaracion.servicio_estado_exterior = request.POST.get('servicio_estado_exterior')
            if declaracion.servicio_estado_exterior == "si":
                declaracion.es_residente = True
                declaracion.formulario_tipo = "210"
                declaracion.save()
                return redirect('renta:formulario_210')
            else:
                declaracion.es_residente = False
                declaracion.formulario_tipo = "110"
                declaracion.save()
                return render(request, "renta/no_residente.html", {"declaracion": declaracion})
    # Primer paso
    return render(request, "renta/preguntas_residencia_1.html", {"declaracion": declaracion})

@login_required
def formulario_210(request):
    declaracion = DeclaracionRenta.objects.filter(usuario=request.user, estado="borrador").first()
    if not declaracion or not declaracion.es_residente or declaracion.formulario_tipo != "210":
        return redirect('renta:preguntas_residencia')
    if request.method == "POST":
        # Guardar datos del formulario (simplificado)
        declaracion.nit = request.POST.get('nit')
        declaracion.dv = request.POST.get('dv')
        declaracion.primer_apellido = request.POST.get('primer_apellido')
        declaracion.segundo_apellido = request.POST.get('segundo_apellido')
        declaracion.primer_nombre = request.POST.get('primer_nombre')
        declaracion.otros_nombres = request.POST.get('otros_nombres')
        declaracion.genero = request.POST.get('genero')
        declaracion.direccion_seccional = request.POST.get('direccion_seccional')
        declaracion.actividad_economica = request.POST.get('actividad_economica')
        declaracion.patrimonio_bruto = request.POST.get('patrimonio_bruto') or 0
        declaracion.deudas = request.POST.get('deudas') or 0
        declaracion.ingresos_brutos = request.POST.get('ingresos_brutos') or 0
        declaracion.deducciones = request.POST.get('deducciones') or 0
        # Simulación de cálculo
        declaracion.renta_liquida = float(declaracion.ingresos_brutos) - float(declaracion.deducciones)
        declaracion.impuesto_calculado = max(declaracion.renta_liquida * 0.19, 0)
        declaracion.saldo_a_pagar = declaracion.impuesto_calculado
        declaracion.save()
        return redirect('renta:resumen')
    return render(request, "renta/formulario_210.html", {"declaracion": declaracion})

@login_required
def resumen_declaracion(request):
    declaracion = DeclaracionRenta.objects.filter(usuario=request.user, estado="borrador").first()
    if not declaracion:
        return redirect('renta:preguntas_residencia')
    if request.method == "POST":
        declaracion.estado = "presentada"
        declaracion.save()
        return redirect('renta:pago')
    return render(request, "renta/resumen.html", {"declaracion": declaracion})

@login_required
def pago_declaracion(request):
    declaracion = DeclaracionRenta.objects.filter(usuario=request.user, estado="presentada").first()
    if not declaracion:
        return redirect('renta:preguntas_residencia')
    if request.method == "POST":
        metodo_pago = request.POST.get('metodo_pago', 'pse')
        referencia = get_random_string(12).upper()
        PagoDeclaracion.objects.create(
            declaracion=declaracion,
            referencia_pago=referencia,
            valor_pagado=declaracion.saldo_a_pagar,
            metodo_pago=metodo_pago,
            estado="exitoso"
        )
        declaracion.estado = "pagada"
        declaracion.save()
        return redirect('renta:exito')
    return render(request, "renta/pago.html", {"declaracion": declaracion})

@login_required
def confirmacion(request):
    declaracion = DeclaracionRenta.objects.filter(usuario=request.user, estado="pagada").first()
    if not declaracion:
        return redirect('renta:preguntas_residencia')
    pago = PagoDeclaracion.objects.filter(declaracion=declaracion).first()
    return render(request, "renta/exito.html", {"declaracion": declaracion, "pago": pago})

@login_required
def lista_declaraciones(request):
    declaraciones = DeclaracionRenta.objects.filter(usuario=request.user).exclude(estado="borrador").order_by('-fecha_creacion')
    return render(request, "renta/lista_declaraciones.html", {"declaraciones": declaraciones})

@login_required
def descargar_pdf(request, declaracion_id):
    declaracion = get_object_or_404(DeclaracionRenta, id=declaracion_id, usuario=request.user)
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from io import BytesIO
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 40
    p.setFont("Helvetica-Bold", 14)
    p.drawCentredString(width/2, y, "REPÚBLICA DE COLOMBIA")
    y -= 25
    p.setFont("Helvetica-Bold", 12)
    p.drawCentredString(width/2, y, "DIRECCIÓN DE IMPUESTOS Y ADUANAS NACIONALES - DIAN")
    y -= 20
    p.setFont("Helvetica-Bold", 11)
    p.drawCentredString(width/2, y, "DECLARACIÓN ANUAL DE RENTA Y COMPLEMENTARIOS - FORMULARIO 210")
    y -= 20
    p.setFont("Helvetica", 10)
    p.drawCentredString(width/2, y, "Año gravable: 2024")
    y -= 40
    p.setFont("Helvetica-Bold", 11)
    p.drawString(40, y, "DATOS DEL DECLARANTE")
    y -= 18
    p.setFont("Helvetica", 10)
    p.drawString(50, y, f"NIT: {declaracion.nit}-{declaracion.dv}")
    y -= 15
    p.drawString(50, y, f"Nombre: {declaracion.primer_nombre} {declaracion.otros_nombres or ''} {declaracion.primer_apellido} {declaracion.segundo_apellido or ''}")
    y -= 15
    p.drawString(50, y, f"Género: {declaracion.genero or 'No especificado'}")
    y -= 15
    p.drawString(50, y, f"Dirección Seccional: {declaracion.direccion_seccional or 'No especificada'}")
    y -= 25
    p.setFont("Helvetica-Bold", 11)
    p.drawString(40, y, "PATRIMONIO")
    y -= 18
    p.setFont("Helvetica", 10)
    p.drawString(50, y, f"Patrimonio Bruto: ${float(declaracion.patrimonio_bruto):,.0f}")
    y -= 15
    p.drawString(50, y, f"Deudas: ${float(declaracion.deudas):,.0f}")
    y -= 15
    p.drawString(50, y, f"Patrimonio Líquido: ${float(declaracion.patrimonio_bruto) - float(declaracion.deudas):,.0f}")
    y -= 25
    p.setFont("Helvetica-Bold", 11)
    p.drawString(40, y, "INGRESOS Y RENTA")
    y -= 18
    p.setFont("Helvetica", 10)
    p.drawString(50, y, f"Ingresos Brutos: ${float(declaracion.ingresos_brutos):,.0f}")
    y -= 15
    p.drawString(50, y, f"Deducciones: ${float(declaracion.deducciones):,.0f}")
    y -= 15
    p.drawString(50, y, f"Renta Líquida: ${float(declaracion.renta_liquida):,.0f}")
    y -= 25
    p.setFont("Helvetica-Bold", 11)
    p.drawString(40, y, "LIQUIDACIÓN DEL IMPUESTO")
    y -= 18
    p.setFont("Helvetica", 10)
    p.drawString(50, y, f"Impuesto Sobre la Renta: ${float(declaracion.impuesto_calculado):,.0f}")
    y -= 15
    p.drawString(50, y, f"Saldo a Pagar: ${float(declaracion.saldo_a_pagar):,.0f}")
    y -= 25
    p.setFont("Helvetica-Bold", 11)
    p.drawString(40, y, "OTROS DATOS")
    y -= 18
    p.setFont("Helvetica", 10)
    p.drawString(50, y, f"Estado: {declaracion.get_estado_display()}")
    y -= 15
    p.drawString(50, y, f"Fecha de presentación: {declaracion.fecha_creacion}")
    y -= 30
    p.setFont("Helvetica-Oblique", 9)
    p.drawCentredString(width/2, y, "Este documento es una copia fiel de la declaración presentada ante la DIAN")
    y -= 15
    import datetime
    p.drawCentredString(width/2, y, f"Generado el {datetime.datetime.now().strftime('%d/%m/%Y a las %H:%M:%S')}")
    p.showPage()
    p.save()
    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="declaracion_renta_{declaracion.nit}_{datetime.datetime.now().year}.pdf"'
    return response

@login_required 
def descargar_comprobante(request, pago_id):
    pago = get_object_or_404(PagoDeclaracion, id=pago_id, declaracion__usuario=request.user)
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="comprobante_pago_{pago.referencia_pago}.pdf"'
    
    # Crear comprobante simple
    html_content = f"""
    <html>
    <head><title>Comprobante de Pago</title></head>
    <body>
    <h1>COMPROBANTE DE PAGO ELECTRÓNICO</h1>
    <p><strong>Referencia:</strong> {pago.referencia_pago}</p>
    <p><strong>NIT:</strong> {pago.declaracion.nit}-{pago.declaracion.dv}</p>
    <p><strong>Valor Pagado:</strong> ${pago.valor_pagado}</p>
    <p><strong>Fecha de Pago:</strong> {pago.fecha_pago}</p>
    <p><strong>Estado:</strong> {pago.get_estado_display()}</p>
    <p><strong>Método de Pago:</strong> {pago.metodo_pago}</p>
    </body>
    </html>
    """
    response = HttpResponse(html_content, content_type='text/html')
    response['Content-Disposition'] = f'attachment; filename="comprobante_pago_{pago.referencia_pago}.html"'
    
    return response
