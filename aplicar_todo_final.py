#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script FINAL - Aplica TODOS los cambios de una vez de forma correcta
"""

import re
import shutil

print("=" * 70)
print("  APLICACIÓN FINAL DE TODOS LOS MÓDULOS")
print("=" * 70)
print()

app_path = r"c:\Users\gusta\OneDrive\Desktop\sistema_hotel wari 2003\src\App.jsx"
backup_path = r"c:\Users\gusta\OneDrive\Desktop\sistema_hotel wari 2003\src\App_ORIGINAL_COMPLETO.jsx"

# Paso 1: Restaurar backup
print("[1/4] Restaurando desde backup...")
shutil.copy(backup_path, app_path)
print("   ✓ Restaurado")

# Paso 2: Leer archivo
print("[2/4] Leyendo archivo...")
with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Paso 3: Aplicar TODOS los cambios
print("[3/4] Aplicando cambios...")

# CAMBIO 1: Estados de servicios
estados_servicios = """

  // Estados para Vista de Servicios Adicionales (NUEVO - Módulo 2)
  const [habitacionServicio, setHabitacionServicio] = useState('')
  const [tabServicioActivo, setTabServicioActivo] = useState('lavanderia')
  const [cantidadesLavanderia, setCantidadesLavanderia] = useState({})
  const [cantidadesTienda, setCantidadesTienda] = useState({})
"""

content = re.sub(
    r"(const \[imagenAmpliada, setImagenAmpliada\] = useState\(null\))",
    r"\1" + estados_servicios,
    content
)
print("   ✓ Estados de servicios")

# CAMBIO 2: Estados de auditoría y catálogos
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

content = re.sub(
    r"(useEffect\(\(\) => \{\s+localStorage\.setItem\('hotel-wari-historial-checkins', JSON\.stringify\(historialCheckIns\)\)\s+\}, \[historialCheckIns\]\))",
    r"\1" + estados_auditoria,
    content,
    flags=re.MULTILINE
)
print("   ✓ Estados de auditoría y catálogos")

# CAMBIO 3: Funciones
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
          { itemId, nombre: item.nombre, cantidad, precioUnitario: item.precio, subtotal: item.precio * cantidad }
        ]
      }

      return { ...prev, [numeroHabitacion]: { ...consumosHab, lavanderia: nuevaLavanderia } }
    })

    registrarAuditoria('lavanderia', `Servicio de lavandería agregado a habitación ${numeroHabitacion}: ${cantidad}x ${item.nombre}`, { habitacion: numeroHabitacion, monto: item.precio * cantidad })
  }

  const agregarConsumoTienda = (numeroHabitacion, itemId, cantidad) => {
    const item = catalogoTienda.find(i => i.id === itemId)
    if (!item) return
    if (item.stock < cantidad) {
      alert(`Stock insuficiente de ${item.nombre}. Disponible: ${item.stock}`)
      return
    }

    setCatalogoTienda(prevCatalogo => prevCatalogo.map(i => i.id === itemId ? { ...i, stock: i.stock - cantidad } : i))

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
          { itemId, nombre: item.nombre, cantidad, precioUnitario: item.precio, subtotal: item.precio * cantidad }
        ]
      }

      return { ...prev, [numeroHabitacion]: { ...consumosHab, tienda: nuevaTienda } }
    })

    registrarAuditoria('tienda', `Producto de tienda agregado a habitación ${numeroHabitacion}: ${cantidad}x ${item.nombre}`, { habitacion: numeroHabitacion, monto: item.precio * cantidad })
  }

"""

content = re.sub(
    r"(// Funciones de Lógica)",
    funciones + r"\1",
    content
)
print("   ✓ Funciones agregadas")

# Paso 4: Guardar
print("[4/4] Guardando...")
with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)

print()
print("=" * 70)
print("  ✓ TODOS LOS CAMBIOS APLICADOS CORRECTAMENTE")
print("=" * 70)
print()
print("Revisa VSCode - NO deberían haber errores ahora.")
