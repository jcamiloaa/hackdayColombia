#!/usr/bin/env python3
"""
Script para listar los asistentes disponibles en tu cuenta de OpenAI
"""

import os
from openai import OpenAI

# Configura tu API key aquí o como variable de entorno
API_KEY = "tu-api-key-aqui"  # Reemplaza con tu API key real
# O usa: API_KEY = os.getenv("API_OPENAI_KEY")

def list_assistants():
    try:
        client = OpenAI(api_key=API_KEY)
        
        print("🔍 Listando asistentes disponibles...\n")
        
        # Listar asistentes
        assistants = client.beta.assistants.list()
        
        if not assistants.data:
            print("❌ No se encontraron asistentes en tu cuenta.")
            print("💡 Necesitas crear un asistente primero en: https://platform.openai.com/playground?mode=assistant")
            return
        
        print(f"✅ Se encontraron {len(assistants.data)} asistente(s):\n")
        
        for i, assistant in enumerate(assistants.data, 1):
            print(f"{i}. 📋 Nombre: {assistant.name or 'Sin nombre'}")
            print(f"   🆔 ID: {assistant.id}")
            print(f"   🤖 Modelo: {assistant.model}")
            print(f"   📝 Instrucciones: {assistant.instructions[:100]}..." if assistant.instructions else "   📝 Sin instrucciones")
            print(f"   🛠️  Herramientas: {[tool.type for tool in assistant.tools]}")
            print("-" * 50)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Verifica que tu API key sea correcta")

if __name__ == "__main__":
    list_assistants()
