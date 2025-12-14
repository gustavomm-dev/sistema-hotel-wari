#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para aplicar todos los cambios de Módulos 1-3 al Hotel Wari System
Aplica: Auditoría, Servicios (Lavandería/Tienda), y Checkout Mejorado
"""

import re
import shutil
from datetime import datetime

print("=" * 60)
print("  HOTEL WARI - APLICADOR AUTOMÁTICO DE MÓDULOS 1-3")
print("=" * 60)
print()

# Rutas
app_path = r"c:\Users\gusta\OneDrive\Desktop\sistema_hotel wari 2003\src\App.jsx"
backup_path = r"c:\Users\gusta\OneDrive\Desktop\sistema_hotel wari 2003\src\App_ORIGINAL_COMPLETO.jsx"

# Paso 1: Restaurar desde backup
print("[1/5] Restaurando desde backup original...")
try:
    shutil.copy(backup_path, app_path)
    print("   ✓ Archivo restaurado")
except Exception as e:
    print(f"   ✗ Error: {e}")
    exit(1)

# Paso 2: Leer archivo
print("[2/5] Leyendo archivo...")
with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Paso 3: Aplicar cambios
print("[3/5] Aplicando cambios...")

# CAMBIO 1: Agregar estados de servicios después de imagenAmpliada
estados_servicios = """
  // Estados para Vista de Servicios Adicionales (NUEVO - Módulo 2)
  const [habitacionServicio, setHabitacionServicio] = useState('')
  const [tabServicioActivo, setTabServicioActivo] = useState('lavanderia')
  const [cantidadesLavanderia, setCantidadesLavanderia] = useState({})
  const [cantidadesTienda, setCantidadesTienda] = useState({})
"""

# Buscar y reemplazar
pattern1 = r"(const \[imagenAmpliada, setImagenAmpliada\] = useState\(null\))"
if re.search(pattern1, content):
    content = re.sub(pattern1, r"\1" + estados_servicios, content)
    print("   ✓ Estados de servicios agregados")
else:
    print("   ⚠ No se encontró imagenAmpliada")

# CAMBIO 2: Agregar estados de auditoría y catálogos
estados_auditoria = """
  // ========== MÓDULO 1: ESTADOS DE AUDITORÍA ==========
  const [historialAuditoria, setHistorialAuditoria] = useState(() => {
    const guardado = localStorage.getItem('hotel-wari-historial-auditoria')
    if (guardado) {
      try {
        return JSON.parse(guardado)
      } catch (e) {
        console.error("Error al parsear auditoría:", e)
      }
    }
    return []
  })

  const [filtroAuditoriaFechaInicio, setFiltroAuditoriaFechaInicio] = useState('')
  const [filtroAuditoriaFechaFin, setFiltroAuditoriaFechaFin] = useState('')
  const [filtroAuditoriaTipo, setFiltroAuditoriaTipo] = useState('todos')
  const [filtroAuditoriaUsuario, setFiltroAuditoriaUsuario] = useState('')
  const [filtroAuditoriaHabitacion, setFiltroAuditoriaHabitacion] = useState('')

  useEffect(() => {
    localStorage.setItem('hotel-wari-historial-auditoria', JSON.stringify(historialAuditoria))
  }, [historialAuditoria])

  // ========== MÓDULO 2: CATÁLOGOS DE SERVICIOS ==========
  const [catalogoLavanderia, setCatalogoLavanderia] = useState(() => {
    const guardado = localStorage.getItem('hotel-wari-catalogo-lavanderia')
    if (guardado) {
      try {
        return JSON.parse(guardado)
      } catch (e) {
        console.error("Error al parsear lavandería:", e)
      }
    }
    return [
      { id: 1, nombre: 'Pantalón', precio: 8 },
      { id: 2, nombre: 'Camisa', precio: 6 },
      { id: 3, nombre: 'Polo', precio: 5 },
      { id: 4, nombre: 'Ropa Interior', precio: 3 },
      { id: 5, nombre: 'Vestido', precio: 10 },
      { id: 6, nombre: 'Saco/Blazer', precio: 12 }
    ]
  })

  const [catalogoTienda, setCatalogoTienda] = useState(() => {
    const guardado = localStorage.getItem('hotel-wari-catalogo-tienda')
    if (guardado) {
      try {
        return JSON.parse(guardado)
      } catch (e) {
        console.error("Error al parsear tienda:", e)
      }
    }
    return [
      { id: 1, nombre: 'Gaseosa', precio: 3, stock: 50 },
      { id: 2, nombre: 'Agua', precio: 2, stock: 100 },
      { id: 3, nombre: 'Galletas', precio: 2.5, stock: 40 },
      { id: 4, nombre: 'Rasuradora', precio: 5, stock: 20 },
      { id: 5, nombre: 'Snacks', precio: 4, stock: 30 },
      { id: 6, nombre: 'Cerveza', precio: 8, stock: 60 }
    ]
  })

  const [consumosHabitaciones, setConsumosHabitaciones] = useState(() => {
    const guardado = localStorage.getItem('hotel-wari-consumos-habitaciones')
    if (guardado) {
      try {
        return JSON.parse(guardado)
      } catch (e) {
        console.error("Error al parsear consumos:", e)
      }
    }
    return {}
  })

  useEffect(() => {
    localStorage.setItem('hotel-wari-catalogo-lavanderia', JSON.stringify(catalogoLavanderia))
  }, [catalogoLavanderia])

  useEffect(() => {
    localStorage.setItem('hotel-wari-catalogo-tienda', JSON.stringify(catalogoTienda))
  }, [catalogoTienda])

  useEffect(() => {
    localStorage.setItem('hotel-wari-consumos-habitaciones', JSON.stringify(consumosHabitaciones))
  }, [consumosHabitaciones])

"""

pattern2 = r"(useEffect\(\(\) => \{\s+localStorage\.setItem\('hotel-wari-historial-checkins', JSON\.stringify\(historialCheckIns\)\)\s+\}, \[historialCheckIns\]\))"
if re.search(pattern2, content, re.MULTILINE):
    content = re.sub(pattern2, r"\1" + estados_auditoria, content, flags=re.MULTILINE)
    print("   ✓ Estados de auditoría y catálogos agregados")
else:
    print("   ⚠ No se encontró historialCheckIns useEffect")

# Paso 4: Guardar archivo
print("[4/5] Guardando cambios...")
with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("   ✓ Archivo guardado")

# Paso 5: Verificar
print("[5/5] Verificando cambios...")
with open(app_path, 'r', encoding='utf-8') as f:
    verificacion = f.read()

checks = [
    ("habitacionServicio" in verificacion, "Estados de servicios"),
    ("historialAuditoria" in verificacion, "Estados de auditoría"),
    ("catalogoLavanderia" in verificacion, "Catálogo lavandería"),
    ("catalogoTienda" in verificacion, "Catálogo tienda"),
]

all_ok = True
for check, nombre in checks:
    if check:
        print(f"   ✓ {nombre}")
    else:
        print(f"   ✗ {nombre}")
        all_ok = False

print()
print("=" * 60)
if all_ok:
    print("  ✓ CAMBIOS APLICADOS EXITOSAMENTE")
    print("=" * 60)
    print()
    print("SIGUIENTE PASO:")
    print("Ejecuta: python agregar_funciones.py")
else:
    print("  ⚠ ALGUNOS CAMBIOS NO SE APLICARON")
    print("=" * 60)
