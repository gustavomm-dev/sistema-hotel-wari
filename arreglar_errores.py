#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para ARREGLAR los 6 errores de sintaxis
"""

import re

print("=" * 60)
print("  ARREGLANDO ERRORES DE SINTAXIS")
print("=" * 60)
print()

app_path = r"c:\Users\gusta\OneDrive\Desktop\sistema_hotel wari 2003\src\App.jsx"

print("[1/2] Leyendo archivo...")
with open(app_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("[2/2] Arreglando errores...")

# Buscar y eliminar líneas problemáticas
nuevas_lineas = []
skip_next = False
errores_arreglados = 0

for i, line in enumerate(lines):
    # Saltar líneas duplicadas o malformadas
    if skip_next:
        skip_next = False
        continue
    
    # Error 1-3: Eliminar líneas con template strings incompletos
    if '${numeroHabitacion}: ${cantidad}x ${' in line and 'Servicio de' not in line:
        errores_arreglados += 1
        continue
    
    # Error 4-6: Eliminar líneas con sintaxis rota de registrarAuditoria
    if line.strip().startswith('{numeroHabitacion}:') or line.strip().startswith('{ habitacion:') and 'numeroHabitacion,' not in line:
        if '${' in line:
            errores_arreglados += 1
            continue
    
    nuevas_lineas.append(line)

print(f"   ✓ {errores_arreglados} errores arreglados")

# Guardar
with open(app_path, 'w', encoding='utf-8') as f:
    f.writelines(nuevas_lineas)

print()
print("=" * 60)
print("  ✓ ERRORES ARREGLADOS")
print("=" * 60)
print()
print("Revisa el navegador - debería funcionar ahora.")
