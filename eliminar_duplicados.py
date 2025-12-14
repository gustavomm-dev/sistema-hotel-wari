#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para eliminar declaraciones duplicadas de funciones
"""

import re

print("=" * 60)
print("  ELIMINANDO DUPLICACIONES")
print("=" * 60)
print()

app_path = r"c:\Users\gusta\OneDrive\Desktop\sistema_hotel wari 2003\src\App.jsx"

print("[1/3] Leyendo archivo...")
with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

print("[2/3] Buscando y eliminando duplicados...")

# Encontrar todas las declaraciones de registrarAuditoria
matches = list(re.finditer(r'const registrarAuditoria = \(accion, detalles, extras = \{\}\) =>', content))
print(f"   Encontradas {len(matches)} declaraciones de registrarAuditoria")

if len(matches) > 1:
    # Mantener solo la primera, eliminar las demás
    # Encontrar el inicio de la segunda declaración hasta el final de la función
    segunda_pos = matches[1].start()
    
    # Buscar desde la segunda declaración hasta encontrar el cierre de la función
    # Buscamos el patrón completo de la función duplicada
    patron_funcion_completa = r'const registrarAuditoria = \(accion, detalles, extras = \{\}\) => \{.*?\n  \}\n\n  const agregarConsumoLavanderia'
    
    # Eliminar desde la segunda declaración
    content_antes = content[:segunda_pos]
    content_despues = content[segunda_pos:]
    
    # Buscar el final de las funciones duplicadas (hasta // Funciones de Lógica)
    match_fin = re.search(r'(const agregarConsumoTienda.*?\n  \})\n\n  // Funciones de Lógica', content_despues, re.DOTALL)
    
    if match_fin:
        # Eliminar todo el bloque duplicado
        content_despues = content_despues[match_fin.end() - len('  // Funciones de Lógica'):]
        content = content_antes + content_despues
        print("   ✓ Funciones duplicadas eliminadas")
    else:
        print("   ⚠ No se pudo encontrar el final del bloque duplicado")

print("[3/3] Guardando...")
with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)

print()
print("=" * 60)
print("  ✓ DUPLICACIONES ELIMINADAS")
print("=" * 60)
print()
print("Revisa VSCode - los errores deberían desaparecer.")
