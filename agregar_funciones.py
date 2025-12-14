#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script PARTE 2: Agregar funciones de auditoría y servicios
"""

import re

print("=" * 60)
print("  PARTE 2: AGREGANDO FUNCIONES")
print("=" * 60)
print()

app_path = r"c:\Users\gusta\OneDrive\Desktop\sistema_hotel wari 2003\src\App.jsx"

print("[1/3] Leyendo archivo...")
with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

print("[2/3] Agregando funciones...")

# Funciones a agregar
funciones = """
  // ========== MÓDULO 1: FUNCIÓN DE AUDITORÍA ==========
  const registrarAuditoria = (accion, detalles, extras = {}) => {
    const ahora = new Date()
    const fecha = ahora.toLocaleDateString('es-PE')
    const hora = `${ahora.getHours()}:${ahora.getMinutes().toString().padStart(2, '0')}`
    
    const registroAuditoria = {
      id: Date.now(),
      fecha: fecha,
      hora: hora,
      usuario: usuarioActual?.usuario || 'Sistema',
      rol: usuarioActual?.rol || 'N/A',
      accion: accion,
      detalles: detalles,
      habitacion: extras.habitacion || null,
      monto: extras.monto || null
    }

    setHistorialAuditoria(prevHistorial => [registroAuditoria, ...prevHistorial])
  }

  // ========== MÓDULO 2: FUNCIONES DE SERVICIOS ==========
  const agregarConsumoLavanderia = (numeroHabitacion, itemId, cantidad) => {
    const item = catalogoLavanderia.find(i => i.id === itemId)
    if (!item) return

    setConsumosHabitaciones(prev => {
      const consumosHab = prev[numeroHabitacion] || { lavanderia: [], tienda: [], desayunos: null }
      
      const existente = consumosHab.lavanderia.find(c => c.itemId === itemId)
      
      let nuevaLavanderia
      if (existente) {
        nuevaLavanderia = consumosHab.lavanderia.map(c =>
          c.itemId === itemId
            ? { ...c, cantidad: c.cantidad + cantidad, subtotal: (c.cantidad + cantidad) * c.precioUnitario }
            : c
        )
      } else {
        nuevaLavanderia = [
          ...consumosHab.lavanderia,
          {
            itemId,
            nombre: item.nombre,
            cantidad,
            precioUnitario: item.precio,
            subtotal: item.precio * cantidad
          }
        ]
      }

      return {
        ...prev,
        [numeroHabitacion]: {
          ...consumosHab,
          lavanderia: nuevaLavanderia
        }
      }
    })

    registrarAuditoria(
      'lavanderia',
      `Servicio de lavandería agregado a habitación ${numeroHabitacion}: ${cantidad}x ${item.nombre}`,
      { habitacion: numeroHabitacion, monto: item.precio * cantidad }
    )
  }

  const agregarConsumoTienda = (numeroHabitacion, itemId, cantidad) => {
    const item = catalogoTienda.find(i => i.id === itemId)
    if (!item) return

    if (item.stock < cantidad) {
      alert(`Stock insuficiente de ${item.nombre}. Disponible: ${item.stock}`)
      return
    }

    setCatalogoTienda(prevCatalogo =>
      prevCatalogo.map(i =>
        i.id === itemId
          ? { ...i, stock: i.stock - cantidad }
          : i
      )
    )

    setConsumosHabitaciones(prev => {
      const consumosHab = prev[numeroHabitacion] || { lavanderia: [], tienda: [], desayunos: null }
      
      const existente = consumosHab.tienda.find(c => c.itemId === itemId)
      
      let nuevaTienda
      if (existente) {
        nuevaTienda = consumosHab.tienda.map(c =>
          c.itemId === itemId
            ? { ...c, cantidad: c.cantidad + cantidad, subtotal: (c.cantidad + cantidad) * c.precioUnitario }
            : c
        )
      } else {
        nuevaTienda = [
          ...consumosHab.tienda,
          {
            itemId,
            nombre: item.nombre,
            cantidad,
            precioUnitario: item.precio,
            subtotal: item.precio * cantidad
          }
        ]
      }

      return {
        ...prev,
        [numeroHabitacion]: {
          ...consumosHab,
          tienda: nuevaTienda
        }
      }
    })

    registrarAuditoria(
      'tienda',
      `Producto de tienda agregado a habitación ${numeroHabitacion}: ${cantidad}x ${item.nombre}`,
      { habitacion: numeroHabitacion, monto: item.precio * cantidad }
    )
  }

"""

# Buscar el comentario "// Funciones de Lógica" y agregar antes
pattern = r"(// Funciones de Lógica)"
if re.search(pattern, content):
    content = re.sub(pattern, funciones + r"\1", content)
    print("   ✓ Funciones agregadas")
else:
    print("   ✗ No se encontró '// Funciones de Lógica'")

print("[3/3] Guardando...")
with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)

print()
print("=" * 60)
print("  ✓ FUNCIONES AGREGADAS EXITOSAMENTE")
print("=" * 60)
print()
print("¡LISTO! Revisa la app en el navegador.")
print("Los cambios deberían verse automáticamente.")
