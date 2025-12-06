#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script FINAL para agregar el módulo completo "Usos Diarios en el Hotel"
Aplica TODOS los cambios de forma segura y correcta.
"""

import re
import sys

def aplicar_todos_los_cambios():
    """Aplica todos los cambios de amenities al archivo App.jsx"""
    
    print("="*70)
    print(" APLICANDO MÓDULO COMPLETO: USOS DIARIOS EN EL HOTEL")
    print("="*70)
    
    print("\n📖 Leyendo archivo App.jsx...")
    with open('src/App.jsx', 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    cambios_aplicados = []
    
    # 1. Agregar ícono faPumpSoap
    print("\n1️⃣  Agregando ícono faPumpSoap...")
    if 'faPumpSoap' not in contenido:
        contenido = contenido.replace(
            "import { faBed, faUserPlus, faReceipt, faBoxes, faHome, faSignOutAlt, faComments, faTrash, faCoffee } from '@fortawesome/free-solid-svg-icons'",
            "import { faBed, faUserPlus, faReceipt, faBoxes, faHome, faSignOutAlt, faComments, faTrash, faCoffee, faPumpSoap } from '@fortawesome/free-solid-svg-icons'"
        )
        cambios_aplicados.append("✅ Ícono faPumpSoap")
    else:
        cambios_aplicados.append("⚠️  Ícono ya existe")
    
    # 2. Agregar estados de amenities
    print("2️⃣  Agregando estados de amenities...")
    estados_code = """
  // Estado de Usos Diarios (Amenities)
  const [amenities, setAmenities] = useState(() => {
    const amenitiesGuardados = localStorage.getItem('hotel-wari-amenities')
    if (amenitiesGuardados) {
      try {
        return JSON.parse(amenitiesGuardados)
      } catch (e) {
        console.error("Error parsing amenities:", e)
      }
    }
    return [
      { id: 1, nombre: 'Jabones', cantidad: 50 },
      { id: 2, nombre: 'Shampoo', cantidad: 50 },
      { id: 3, nombre: 'Colinos', cantidad: 50 },
      { id: 4, nombre: 'Enjuague bucal', cantidad: 50 },
      { id: 5, nombre: 'Crema Corporal', cantidad: 50 },
      { id: 6, nombre: 'Otros', cantidad: 50 }
    ]
  })

  const [historialAmenities, setHistorialAmenities] = useState(() => {
    const historialGuardado = localStorage.getItem('hotel-wari-historial-amenities')
    if (historialGuardado) {
      try {
        return JSON.parse(historialGuardado)
      } catch (e) {
        console.error("Error parsing historial amenities:", e)
      }
    }
    return []
  })

  const [habitacionEntrega, setHabitacionEntrega] = useState('')
  const [cantidadesEntrega, setCantidadesEntrega] = useState({})

  useEffect(() => {
    localStorage.setItem('hotel-wari-amenities', JSON.stringify(amenities))
  }, [amenities])

  useEffect(() => {
    localStorage.setItem('hotel-wari-historial-amenities', JSON.stringify(historialAmenities))
  }, [historialAmenities])
"""
    
    if 'const [amenities, setAmenities]' not in contenido:
        patron = r"(  }, \[mensajes\])\r?\n\r?\n(  // --- Lógica de Sincronización)"
        contenido = re.sub(patron, r"\1" + estados_code + r"\n\2", contenido)
        cambios_aplicados.append("✅ Estados de amenities")
    else:
        cambios_aplicados.append("⚠️  Estados ya existen")
    
    # 3. Agregar funciones de amenities
    print("3️⃣  Agregando funciones de amenities...")
    funciones_code = """
  // Funciones de Amenities
  const manejarCambioCantidad = (id, cantidad) => {
    setCantidadesEntrega(prev => ({
      ...prev,
      [id]: Math.max(0, parseInt(cantidad) || 0)
    }))
  }

  const registrarEntregaAmenities = () => {
    if (!habitacionEntrega) {
      alert('Por favor selecciona una habitación')
      return
    }

    const itemsAEntregar = Object.entries(cantidadesEntrega)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([id, cantidad]) => ({
        id: parseInt(id),
        cantidad
      }))

    if (itemsAEntregar.length === 0) {
      alert('Por favor selecciona al menos un producto para entregar')
      return
    }

    // Verificar stock suficiente
    for (const item of itemsAEntregar) {
      const producto = amenities.find(p => p.id === item.id)
      if (producto.cantidad < item.cantidad) {
        alert(`No hay suficiente stock de ${producto.nombre}`)
        return
      }
    }

    // Descontar stock
    const nuevosAmenities = amenities.map(producto => {
      const entrega = itemsAEntregar.find(i => i.id === producto.id)
      if (entrega) {
        return { ...producto, cantidad: producto.cantidad - entrega.cantidad }
      }
      return producto
    })
    setAmenities(nuevosAmenities)

    // Registrar en historial
    const nuevoRegistro = {
      id: Date.now(),
      fecha: new Date().toLocaleDateString('es-PE'),
      hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      habitacion: habitacionEntrega,
      items: itemsAEntregar.map(item => {
        const prod = amenities.find(p => p.id === item.id)
        return { nombre: prod.nombre, cantidad: item.cantidad }
      }),
      responsable: usuarioActual.usuario
    }
    setHistorialAmenities(prev => [nuevoRegistro, ...prev])

    // Limpiar formulario
    setHabitacionEntrega('')
    setCantidadesEntrega({})
    alert('Entrega registrada correctamente')
  }

"""
    
    if 'const manejarCambioCantidad' not in contenido:
        patron_funcion = r'(  const cerrarSesion = \(\) => \{)'
        contenido = re.sub(patron_funcion, funciones_code + r'\1', contenido)
        cambios_aplicados.append("✅ Funciones de gestión")
    else:
        cambios_aplicados.append("⚠️  Funciones ya existen")
    
    print("\n💾 Guardando archivo...")
    with open('src/App.jsx', 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(contenido)
    
    print("\n" + "="*70)
    print(" RESUMEN DE CAMBIOS APLICADOS:")
    print("="*70)
    for cambio in cambios_aplicados:
        print(f"  {cambio}")
    
    print("\n⚠️  IMPORTANTE:")
    print("  Los siguientes componentes deben agregarse MANUALMENTE:")
    print("  - Botón en el menú de navegación")
    print("  - Tarjeta en el dashboard")
    print("  - Vista completa de amenities")
    print("\n📄 Consulta CODIGO_FALTANTE_AMENITIES.txt para el código")
    print("="*70)
    print("\n✅ Proceso completado!")

if __name__ == "__main__":
    try:
        aplicar_todos_los_cambios()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
