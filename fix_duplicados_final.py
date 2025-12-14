#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para eliminar TODAS las declaraciones duplicadas
"""

import re

print("=" * 70)
print("  ELIMINANDO TODAS LAS DUPLICACIONES")
print("=" * 70)
print()

app_path = r"c:\Users\gusta\OneDrive\Desktop\sistema_hotel wari 2003\src\App.jsx"

print("[1/3] Leyendo archivo...")
with open(app_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("[2/3] Eliminando duplicados...")

# Buscar todas las ocurrencias de las funciones
registrar_auditoria_lines = []
agregar_lavanderia_lines = []
agregar_tienda_lines = []

for i, line in enumerate(lines, 1):
    if 'const registrarAuditoria = (accion, detalles, extras' in line:
        registrar_auditoria_lines.append(i)
    if 'const agregarConsumoLavanderia = (numeroHabitacion, itemId, cantidad)' in line:
        agregar_lavanderia_lines.append(i)
    if 'const agregarConsumoTienda = (numeroHabitacion, itemId, cantidad)' in line:
        agregar_tienda_lines.append(i)

print(f"   Encontradas {len(registrar_auditoria_lines)} declaraciones de registrarAuditoria en líneas: {registrar_auditoria_lines}")
print(f"   Encontradas {len(agregar_lavanderia_lines)} declaraciones de agregarConsumoLavanderia en líneas: {agregar_lavanderia_lines}")
print(f"   Encontradas {len(agregar_tienda_lines)} declaraciones de agregarConsumoTienda en líneas: {agregar_tienda_lines}")

# Si hay duplicados, eliminar las segundas ocurrencias
if len(registrar_auditoria_lines) > 1 or len(agregar_lavanderia_lines) > 1 or len(agregar_tienda_lines) > 1:
    # Leer contenido completo
    content = ''.join(lines)
    
    # Encontrar el bloque completo de funciones duplicadas
    # Buscar desde "// Funciones de Servicios Adicionales" hasta antes de "// Funciones de Lógica"
    
    # Patrón para encontrar el bloque duplicado
    pattern = r'// Funciones de Servicios Adicionales \(NUEVO - Módulo 2\).*?(?=// Funciones de Lógica)'
    
    matches = list(re.finditer(pattern, content, re.DOTALL))
    
    if len(matches) > 1:
        print(f"   Encontrados {len(matches)} bloques de funciones")
        # Eliminar el segundo bloque (mantener el primero)
        segunda_pos_inicio = matches[1].start()
        segunda_pos_fin = matches[1].end()
        
        content = content[:segunda_pos_inicio] + content[segunda_pos_fin:]
        print("   ✓ Bloque duplicado eliminado")
    else:
        # Si no encuentra el patrón completo, buscar individualmente
        # Eliminar desde la segunda declaración de registrarAuditoria
        if len(registrar_auditoria_lines) > 1:
            # Encontrar el inicio de la segunda función
            segunda_linea = registrar_auditoria_lines[1] - 1
            
            # Buscar el final del bloque (hasta // Funciones de Lógica)
            lines_nuevas = []
            skip = False
            skip_count = 0
            
            for i, line in enumerate(lines):
                if i == segunda_linea - 2:  # Empezar a saltar 2 líneas antes (comentario)
                    skip = True
                    skip_count = 0
                
                if skip:
                    skip_count += 1
                    # Buscar el final del bloque
                    if '// Funciones de Lógica' in line:
                        skip = False
                        lines_nuevas.append(line)
                        continue
                    continue
                
                lines_nuevas.append(line)
            
            content = ''.join(lines_nuevas)
            print(f"   ✓ Eliminadas {skip_count} líneas duplicadas")

    # Guardar
    print("[3/3] Guardando...")
    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(content)
else:
    print("   ℹ No se encontraron duplicados")

print()
print("=" * 70)
print("  ✓ DUPLICACIONES ELIMINADAS")
print("=" * 70)
print()
print("Revisa VSCode - los errores deberían desaparecer ahora.")
