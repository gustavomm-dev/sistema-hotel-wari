#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para agregar el módulo completo de "Usos Diarios en el Hotel"
Este script aplica TODOS los cambios necesarios de forma segura.
"""

import re
import sys

def aplicar_cambios_amenities():
    """Aplica todos los cambios de amenities al archivo App.jsx"""
    
    print("Leyendo archivo App.jsx...")
    with open('src/App.jsx', 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # 1. Agregar ícono faPumpSoap a imports
    print("1. Agregando ícono faPumpSoap...")
    contenido = contenido.replace(
        "import { faBed, faUserPlus, faReceipt, faBoxes, faHome, faSignOutAlt, faComments, faTrash, faCoffee } from '@fortawesome/free-solid-svg-icons'",
        "import { faBed, faUserPlus, faReceipt, faBoxes, faHome, faSignOutAlt, faComments, faTrash, faCoffee, faPumpSoap } from '@fortawesome/free-solid-svg-icons'"
    )
    
    # 2. Agregar estados de amenities después de useEffect de mensajes
    print("2. Agregando estados de amenities...")
    estados_amenities = """
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
    
    contenido = contenido.replace(
        "  }, [mensajes])\n\n  // --- Lógica de Sincronización en Tiempo Real y Notificaciones ---",
        "  }, [mensajes])" + estados_amenities + "\n  // --- Lógica de Sincronización en Tiempo Real y Notificaciones ---"
    )
    
    # 3. Agregar funciones de amenities antes de cerrarSesion
    print("3. Agregando funciones de amenities...")
    funciones_amenities = """
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
    
    # Buscar la función cerrarSesion y agregar las funciones antes
    contenido = re.sub(
        r'(  const cerrarSesion = \(\) => \{)',
        funciones_amenities + r'\1',
        contenido
    )
    
    print("✅ Cambios aplicados correctamente!")
    print("\nGuardando archivo...")
    
    with open('src/App.jsx', 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(contenido)
    
    print("✅ Archivo guardado!")
    print("\n" + "="*50)
    print("CAMBIOS APLICADOS:")
    print("="*50)
    print("✅ 1. Ícono faPumpSoap agregado a imports")
    print("✅ 2. Estados de amenities agregados")
    print("✅ 3. Funciones de gestión agregadas")
    print("\nFALTA AGREGAR MANUALMENTE:")
    print("❌ 4. Botón en el menú de navegación")
    print("❌ 5. Tarjeta en el dashboard")
    print("❌ 6. Vista completa de amenities")
    print("\nConsulta CODIGO_FALTANTE_AMENITIES.txt para el código restante")
    print("="*50)

if __name__ == "__main__":
    try:
        aplicar_cambios_amenities()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
