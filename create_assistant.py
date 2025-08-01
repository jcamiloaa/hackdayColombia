#!/usr/bin/env python3
"""
Script para crear un asistente de la DIAN
"""

import os
from openai import OpenAI

# Configura tu API key aquí o como variable de entorno
API_KEY = "tu-api-key-aqui"  # Reemplaza con tu API key real
# O usa: API_KEY = os.getenv("API_OPENAI_KEY")

def create_dian_assistant():
    try:
        client = OpenAI(api_key=API_KEY)
        
        print("🤖 Creando asistente virtual de la DIAN...")
        
        assistant = client.beta.assistants.create(
            name="Asistente Virtual DIAN",
            instructions="""Eres un asistente virtual de la DIAN (Dirección de Impuestos y Aduanas Nacionales de Colombia). 

Tu función principal es ayudar a los ciudadanos colombianos con:
- Declaraciones de renta para personas naturales
- Formulario 210 y sus campos
- Fechas límite y calendarios tributarios
- Procesos de pago (PSE, tarjetas, etc.)
- Resolución de dudas sobre el proceso tributario
- Información sobre deducciones y beneficios fiscales
- Ayuda con el portal MUISCA

IMPORTANTE:
- Mantén siempre un tono profesional pero amigable
- Proporciona información precisa y actualizada
- Si no estás seguro de algo, recomienda consultar directamente con la DIAN
- Ayuda paso a paso cuando sea necesario
- Usa ejemplos prácticos cuando sea útil

Responde siempre en español de Colombia.""",
            model="gpt-4o",
            tools=[]  # Sin herramientas adicionales por ahora
        )
        
        print("✅ ¡Asistente creado exitosamente!")
        print(f"🆔 ID del Asistente: {assistant.id}")
        print(f"📋 Nombre: {assistant.name}")
        print(f"🤖 Modelo: {assistant.model}")
        
        print(f"\n📋 Copia este ID a tu archivo .env:")
        print(f"ASSITANT_ID={assistant.id}")
        
        return assistant.id
        
    except Exception as e:
        print(f"❌ Error creando asistente: {e}")
        return None

if __name__ == "__main__":
    create_dian_assistant()
