import { useState, useEffect, useRef } from 'react'
import './App.css'
import fachadaImg from './assets/fachada.jpg'
import simpleImg from './assets/simple.jpg'
import dobleImg from './assets/doble.jpg'
import familiarImg from './assets/familiar.jpg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBed, faUserPlus, faReceipt, faBoxes, faHome, faSignOutAlt, faComments, faTrash, faCoffee, faPumpSoap, faHistory, faFileAlt, faClipboardList, faShoppingCart, faTshirt } from '@fortawesome/free-solid-svg-icons'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { db } from './firebase'
import {
  saveToFirestore,
  loadFromFirestore,
  subscribeToCollection,
  migrateLocalStorageToFirestore,
  testFirestoreConnection
} from './firebaseHelpers'


// Constantes en Español
const PRECIOS_HABITACION = {
  'Simple': 100,
  'Doble': 120,
  'Familiar': 180
}

const IMAGENES_HABITACION = {
  'Simple': simpleImg,
  'Doble': dobleImg,
  'Familiar': familiarImg
}

// Base de Datos de Usuarios Autorizados
const USUARIOS_AUTORIZADOS = [
  { usuario: 'admin', clave: '1234', rol: 'administrador' },
  { usuario: 'recepcion', clave: 'user', rol: 'recepcionista' }
]

function App() {
  // Estados de la Aplicación (Nombres en Español)
  const [mostrarLogin, setMostrarLogin] = useState(false)

  // Inicializar estado de autenticación desde localStorage
  const [usuarioActual, setUsuarioActual] = useState(() => {
    const usuarioGuardado = localStorage.getItem('hotel-wari-usuario')
    try {
      return usuarioGuardado ? JSON.parse(usuarioGuardado) : null
    } catch (e) {
      return null
    }
  })

  const [estaAutenticado, setEstaAutenticado] = useState(() => {
    const usuarioGuardado = localStorage.getItem('hotel-wari-usuario')
    try {
      const parsed = usuarioGuardado ? JSON.parse(usuarioGuardado) : null
      return !!parsed
    } catch (e) {
      return false
    }
  })

  const [nombreUsuario, setNombreUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')

  // Inicializar vista actual basada en el rol guardado o por defecto
  const [vistaActual, setVistaActual] = useState(() => {
    const usuarioGuardado = localStorage.getItem('hotel-wari-usuario')
    try {
      if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado)
        return usuario && usuario.rol === 'administrador' ? 'facturacion' : 'tablero'
      }
    } catch (e) {
      // Ignorar error
    }
    return 'tablero'
  })

  // Estado del Formulario de Registro
  const [nombreHuesped, setNombreHuesped] = useState('')
  const [dniHuesped, setDniHuesped] = useState('')
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState('')
  const [duracionEstadia, setDuracionEstadia] = useState('')
  const [metodoPagoRegistro, setMetodoPagoRegistro] = useState('Paga al finalizar estadía')

  // Estado del Modal de Confirmación de Salida
  const [mostrarModalSalida, setMostrarModalSalida] = useState(false)
  const [habitacionParaSalida, setHabitacionParaSalida] = useState(null)
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('Paga al finalizar estadía')

  // Estado del Modal de Imagen (Zoom)
  const [imagenAmpliada, setImagenAmpliada] = useState(null)

  // Estados para Vista de Servicios Adicionales (NUEVO - Módulo 2)
  const [habitacionServicio, setHabitacionServicio] = useState('')
  const [tabServicioActivo, setTabServicioActivo] = useState('lavanderia') // 'lavanderia' o 'tienda'
  const [cantidadesLavanderia, setCantidadesLavanderia] = useState({})
  const [cantidadesTienda, setCantidadesTienda] = useState({})

  // Estado Principal de Habitaciones (Estructura de Datos en Español)
  const [habitaciones, setHabitaciones] = useState(() => {
    const habitacionesGuardadas = localStorage.getItem('hotel-wari-habitaciones')
    if (habitacionesGuardadas) {
      try {
        const parsed = JSON.parse(habitacionesGuardadas)
        if (parsed && Array.isArray(parsed)) return parsed
      } catch (e) {
        console.error("Error parsing habitaciones:", e)
      }
    }
    return [
      // Piso 2
      { numero: '201', tipo: 'Simple', piso: 2, estado: 'libre' },
      { numero: '202', tipo: 'Simple', piso: 2, estado: 'ocupado', nombreHuesped: 'Juan Pérez', dniHuesped: '12345678', horaEntrada: '14:30', duracionEstadia: '2 noches', costoTotal: 200 },
      { numero: '203', tipo: 'Doble', piso: 2, estado: 'libre' },
      { numero: '204', tipo: 'Simple', piso: 2, estado: 'libre' },
      { numero: '205', tipo: 'Simple', piso: 2, estado: 'ocupado', nombreHuesped: 'Ana Díaz', dniHuesped: '87654321', horaEntrada: '09:15', duracionEstadia: '1 noche', costoTotal: 100 },
      { numero: '206', tipo: 'Simple', piso: 2, estado: 'libre' },
      { numero: '207', tipo: 'Doble', piso: 2, estado: 'ocupado', nombreHuesped: 'Maria Garcia', dniHuesped: '11223344', horaEntrada: '10:00', duracionEstadia: '1 noche', costoTotal: 120 },
      { numero: '208', tipo: 'Familiar', piso: 2, estado: 'libre' },
      // Piso 3
      { numero: '301', tipo: 'Simple', piso: 3, estado: 'libre' },
      { numero: '302', tipo: 'Simple', piso: 3, estado: 'libre' },
      { numero: '303', tipo: 'Simple', piso: 3, estado: 'libre' },
      { numero: '304', tipo: 'Simple', piso: 3, estado: 'libre' },
      { numero: '305', tipo: 'Simple', piso: 3, estado: 'ocupado', nombreHuesped: 'Carlos Lopez', dniHuesped: '55667788', horaEntrada: '18:45', duracionEstadia: '3 noches', costoTotal: 300 },
      { numero: '306', tipo: 'Simple', piso: 3, estado: 'libre' },
      { numero: '307', tipo: 'Simple', piso: 3, estado: 'libre' },
      { numero: '308', tipo: 'Simple', piso: 3, estado: 'libre' },
      { numero: '309', tipo: 'Simple', piso: 3, estado: 'libre' },
    ]
  })

  // Estado de Historial de Ventas (Facturación)
  const [historialVentas, setHistorialVentas] = useState(() => {
    const historialGuardado = localStorage.getItem('hotel-wari-historial-ventas')
    if (historialGuardado) {
      return JSON.parse(historialGuardado)
    }
    return []
  })

  // Persistencia de Datos
  useEffect(() => {
    localStorage.setItem('hotel-wari-habitaciones', JSON.stringify(habitaciones))
  }, [habitaciones])

  useEffect(() => {
    localStorage.setItem('hotel-wari-historial-ventas', JSON.stringify(historialVentas))
  }, [historialVentas])

  // Estado de Inventario
  const [inventario, setInventario] = useState(() => {
    const inventarioGuardado = localStorage.getItem('hotel-wari-inventario')
    if (inventarioGuardado) {
      return JSON.parse(inventarioGuardado)
    }
    return [
      { id: 1, producto: 'Toallas', categoria: 'Ropa de Cama', cantidad: 25 },
      { id: 2, producto: 'Jabones', categoria: 'Higiene', cantidad: 3 },
      { id: 3, producto: 'Bebidas (Botellas)', categoria: 'Minibar', cantidad: 15 },
      { id: 4, producto: 'Sábanas', categoria: 'Ropa de Cama', cantidad: 8 },
      { id: 5, producto: 'Shampoo', categoria: 'Higiene', cantidad: 2 },
      { id: 6, producto: 'Papel Higiénico', categoria: 'Higiene', cantidad: 30 }
    ]
  })

  useEffect(() => {
    localStorage.setItem('hotel-wari-inventario', JSON.stringify(inventario))
  }, [inventario])

  // Estado de Base de Datos de Clientes
  const [clientes, setClientes] = useState(() => {
    const clientesGuardados = localStorage.getItem('hotel-wari-clientes')
    if (clientesGuardados) {
      return JSON.parse(clientesGuardados)
    }
    return [
      { dni: '12345678', nombre: 'Juan Pérez' },
      { dni: '87654321', nombre: 'Ana Díaz' },
      { dni: '11223344', nombre: 'Maria Garcia' },
      { dni: '55667788', nombre: 'Carlos Lopez' }
    ]
  })

  useEffect(() => {
    localStorage.setItem('hotel-wari-clientes', JSON.stringify(clientes))
  }, [clientes])

  // Estado de Mensajería
  const [mensajes, setMensajes] = useState(() => {
    const mensajesGuardados = localStorage.getItem('hotel-wari-mensajes')
    if (mensajesGuardados) {
      return JSON.parse(mensajesGuardados)
    }
    return []
  })

  const [nuevoMensaje, setNuevoMensaje] = useState('')

  useEffect(() => {
    localStorage.setItem('hotel-wari-mensajes', JSON.stringify(mensajes))
  }, [mensajes])

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

  // Estado de Historial de Check-Ins/Check-Outs (NUEVO)
  const [historialCheckIns, setHistorialCheckIns] = useState(() => {
    const historialGuardado = localStorage.getItem('hotel-wari-historial-checkins')
    if (historialGuardado) {
      try {
        return JSON.parse(historialGuardado)
      } catch (e) {
        console.error("Error parsing historial check-ins:", e)
      }
    }

    // Migrar datos existentes de historialVentas si existe
    const ventasGuardadas = localStorage.getItem('hotel-wari-historial-ventas')
    if (ventasGuardadas) {
      try {
        const ventas = JSON.parse(ventasGuardadas)
        // Convertir historialVentas al nuevo formato
        const checkInsMigrados = ventas.map(venta => ({
          id: venta.id,
          numeroHabitacion: venta.numeroHabitacion,
          tipoHabitacion: venta.tipoHabitacion,
          nombreHuesped: venta.nombreHuesped,
          dniHuesped: venta.dniHuesped,
          fechaCheckIn: venta.fechaSalida, // Usamos fechaSalida como referencia
          horaCheckIn: venta.horaEntrada,
          fechaCheckOut: venta.fechaSalida,
          horaCheckOut: venta.horaSalida,
          duracionEstadia: venta.duracionEstadia,
          costoTotal: venta.costoTotal,
          metodoPago: venta.metodoPago || 'N/A',
          estado: 'finalizado'
        }))
        console.log('✅ Migrados', checkInsMigrados.length, 'registros de historialVentas')
        return checkInsMigrados
      } catch (e) {
        console.error("Error migrando historialVentas:", e)
      }
    }

    return []
  })

  // Estados para filtros de historial
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('')
  const [filtroFechaFin, setFiltroFechaFin] = useState('')
  const [filtroHabitacion, setFiltroHabitacion] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  useEffect(() => {
    localStorage.setItem('hotel-wari-historial-checkins', JSON.stringify(historialCheckIns))
  }, [historialCheckIns])

  // Estado de Historial de Auditoría (NUEVO - Módulo 1)
  const [historialAuditoria, setHistorialAuditoria] = useState(() => {
    const historialGuardado = localStorage.getItem('hotel-wari-historial-auditoria')
    if (historialGuardado) {
      try {
        return JSON.parse(historialGuardado)
      } catch (e) {
        console.error("Error parsing historial auditoría:", e)
      }
    }
    return []
  })

  // Estados para filtros de auditoría
  const [filtroAuditoriaFechaInicio, setFiltroAuditoriaFechaInicio] = useState('')
  const [filtroAuditoriaFechaFin, setFiltroAuditoriaFechaFin] = useState('')
  const [filtroAuditoriaTipo, setFiltroAuditoriaTipo] = useState('todos')
  const [filtroAuditoriaUsuario, setFiltroAuditoriaUsuario] = useState('')
  const [filtroAuditoriaHabitacion, setFiltroAuditoriaHabitacion] = useState('')

  useEffect(() => {
    localStorage.setItem('hotel-wari-historial-auditoria', JSON.stringify(historialAuditoria))
  }, [historialAuditoria])

  // Estado de Catálogos de Servicios (NUEVO - Módulo 2)
  const [catalogoLavanderia, setCatalogoLavanderia] = useState(() => {
    const catalogoGuardado = localStorage.getItem('hotel-wari-catalogo-lavanderia')
    if (catalogoGuardado) {
      try {
        return JSON.parse(catalogoGuardado)
      } catch (e) {
        console.error("Error parsing catálogo lavandería:", e)
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
    const catalogoGuardado = localStorage.getItem('hotel-wari-catalogo-tienda')
    if (catalogoGuardado) {
      try {
        return JSON.parse(catalogoGuardado)
      } catch (e) {
        console.error("Error parsing catálogo tienda:", e)
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

  // Estado de Consumos por Habitación (NUEVO - Módulo 2)
  const [consumosHabitaciones, setConsumosHabitaciones] = useState(() => {
    const consumosGuardados = localStorage.getItem('hotel-wari-consumos-habitaciones')
    if (consumosGuardados) {
      try {
        return JSON.parse(consumosGuardados)
      } catch (e) {
        console.error("Error parsing consumos habitaciones:", e)
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

  // --- FIREBASE: Migración Automática y Sincronización en Tiempo Real ---

  // Migración única de localStorage a Firestore
  useEffect(() => {
    const migrado = localStorage.getItem('firebase-migrated')
    if (!migrado) {
      console.log('🔄 Iniciando migración a Firebase...')
      migrateLocalStorageToFirestore().then(() => {
        localStorage.setItem('firebase-migrated', 'true')
        console.log('✅ Migración a Firebase completada')
      }).catch(error => {
        console.error('❌ Error en migración:', error)
      })
    }
  }, [])

  // Sincronización en tiempo real: Habitaciones
  useEffect(() => {
    const unsubscribe = subscribeToCollection('habitaciones', (data) => {
      if (data.length > 0) {
        setHabitaciones(data)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (habitaciones.length > 0) {
      saveToFirestore('habitaciones', habitaciones)
    }
  }, [habitaciones])

  // Sincronización en tiempo real: Inventario
  useEffect(() => {
    const unsubscribe = subscribeToCollection('inventario', (data) => {
      if (data.length > 0) {
        setInventario(data)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (inventario.length > 0) {
      saveToFirestore('inventario', inventario)
    }
  }, [inventario])

  // Sincronización en tiempo real: Amenities
  useEffect(() => {
    const unsubscribe = subscribeToCollection('amenities', (data) => {
      if (data.length > 0) {
        setAmenities(data)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (amenities.length > 0) {
      saveToFirestore('amenities', amenities)
    }
  }, [amenities])

  // Sincronización en tiempo real: Historial Amenities
  useEffect(() => {
    const unsubscribe = subscribeToCollection('historial-amenities', (data) => {
      if (data.length > 0) {
        setHistorialAmenities(data)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (historialAmenities.length > 0) {
      saveToFirestore('historial-amenities', historialAmenities)
    }
  }, [historialAmenities])

  // Sincronización en tiempo real: Historial Ventas
  useEffect(() => {
    const unsubscribe = subscribeToCollection('historial-ventas', (data) => {
      if (data.length > 0) {
        setHistorialVentas(data)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (historialVentas.length > 0) {
      saveToFirestore('historial-ventas', historialVentas)
    }
  }, [historialVentas])

  // Sincronización en tiempo real: Clientes
  useEffect(() => {
    const unsubscribe = subscribeToCollection('clientes', (data) => {
      if (data.length > 0) {
        setClientes(data)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (clientes.length > 0) {
      saveToFirestore('clientes', clientes)
    }
  }, [clientes])

  // Sincronización en tiempo real: Mensajes
  useEffect(() => {
    const unsubscribe = subscribeToCollection('mensajes', (data) => {
      if (data.length > 0) {
        setMensajes(data)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (mensajes.length > 0) {
      saveToFirestore('mensajes', mensajes)
    }
  }, [mensajes])

  // Sincronización en tiempo real: Historial Check-Ins
  useEffect(() => {
    const unsubscribe = subscribeToCollection('historial-checkins', (data) => {
      if (data.length > 0) {
        setHistorialCheckIns(data)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (historialCheckIns.length > 0) {
      saveToFirestore('historial-checkins', historialCheckIns)
    }
  }, [historialCheckIns])

  // Sincronización en tiempo real: Historial Auditoría (NUEVO)
  useEffect(() => {
    const unsubscribe = subscribeToCollection('historial-auditoria', (data) => {
      if (data.length > 0) {
        setHistorialAuditoria(data)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (historialAuditoria.length > 0) {
      saveToFirestore('historial-auditoria', historialAuditoria)
    }
  }, [historialAuditoria])

  // Sincronización en tiempo real: Catálogo Lavandería (NUEVO)
  useEffect(() => {
    const unsubscribe = subscribeToCollection('catalogo-lavanderia', (data) => {
      if (data.length > 0) {
        setCatalogoLavanderia(data)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (catalogoLavanderia.length > 0) {
      saveToFirestore('catalogo-lavanderia', catalogoLavanderia)
    }
  }, [catalogoLavanderia])

  // Sincronización en tiempo real: Catálogo Tienda (NUEVO)
  useEffect(() => {
    const unsubscribe = subscribeToCollection('catalogo-tienda', (data) => {
      if (data.length > 0) {
        setCatalogoTienda(data)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (catalogoTienda.length > 0) {
      saveToFirestore('catalogo-tienda', catalogoTienda)
    }
  }, [catalogoTienda])

  // Sincronización en tiempo real: Consumos Habitaciones (NUEVO)
  useEffect(() => {
    const unsubscribe = subscribeToCollection('consumos-habitaciones', (data) => {
      if (data.length > 0) {
        // Firebase devuelve array, pero necesitamos objeto
        const consumosObj = data[0] || {}
        setConsumosHabitaciones(consumosObj)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (Object.keys(consumosHabitaciones).length > 0) {
      // Guardar como array con un solo elemento para Firebase
      saveToFirestore('consumos-habitaciones', [consumosHabitaciones])
    }
  }, [consumosHabitaciones])



  // --- Sincronización en Tiempo Real entre Pestañas/Sesiones ---
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Sincronizar habitaciones
      if (e.key === 'hotel-wari-habitaciones' && e.newValue) {
        try {
          const nuevasHabitaciones = JSON.parse(e.newValue)
          if (nuevasHabitaciones && Array.isArray(nuevasHabitaciones)) {
            setHabitaciones(nuevasHabitaciones)
          }
        } catch (error) {
          console.error("Error al sincronizar habitaciones:", error)
        }
      }

      // Sincronizar inventario
      if (e.key === 'hotel-wari-inventario' && e.newValue) {
        try {
          const nuevoInventario = JSON.parse(e.newValue)
          if (nuevoInventario && Array.isArray(nuevoInventario)) {
            setInventario(nuevoInventario)
          }
        } catch (error) {
          console.error("Error al sincronizar inventario:", error)
        }
      }

      // Sincronizar amenities
      if (e.key === 'hotel-wari-amenities' && e.newValue) {
        try {
          const nuevosAmenities = JSON.parse(e.newValue)
          if (nuevosAmenities && Array.isArray(nuevosAmenities)) {
            setAmenities(nuevosAmenities)
          }
        } catch (error) {
          console.error("Error al sincronizar amenities:", error)
        }
      }

      // Sincronizar historial de amenities
      if (e.key === 'hotel-wari-historial-amenities' && e.newValue) {
        try {
          const nuevoHistorial = JSON.parse(e.newValue)
          if (nuevoHistorial && Array.isArray(nuevoHistorial)) {
            setHistorialAmenities(nuevoHistorial)
          }
        } catch (error) {
          console.error("Error al sincronizar historial amenities:", error)
        }
      }

      // Sincronizar historial de ventas
      if (e.key === 'hotel-wari-historial-ventas' && e.newValue) {
        try {
          const nuevoHistorial = JSON.parse(e.newValue)
          if (nuevoHistorial && Array.isArray(nuevoHistorial)) {
            setHistorialVentas(nuevoHistorial)
          }
        } catch (error) {
          console.error("Error al sincronizar historial ventas:", error)
        }
      }

      // Sincronizar clientes
      if (e.key === 'hotel-wari-clientes' && e.newValue) {
        try {
          const nuevosClientes = JSON.parse(e.newValue)
          if (nuevosClientes && Array.isArray(nuevosClientes)) {
            setClientes(nuevosClientes)
          }
        } catch (error) {
          console.error("Error al sincronizar clientes:", error)
        }
      }

      // Sincronizar mensajes
      if (e.key === 'hotel-wari-mensajes' && e.newValue) {
        try {
          const nuevosMensajes = JSON.parse(e.newValue)
          if (nuevosMensajes && Array.isArray(nuevosMensajes)) {
            setMensajes(nuevosMensajes)
          }
        } catch (error) {
          console.error("Error al sincronizar mensajes:", error)
        }
      }
    }

    // Agregar listener para cambios en localStorage
    window.addEventListener('storage', handleStorageChange)

    // Limpiar listener al desmontar
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, []) // Solo se ejecuta una vez al montar el componente

  // --- Lógica de Sincronización en Tiempo Real y Notificaciones ---

  // Referencia para rastrear la cantidad previa de pedidos pendientes
  const prevPendientesRef = useRef(0)
  // Estado para controlar si el audio está habilitado por el usuario
  const [audioHabilitado, setAudioHabilitado] = useState(false)

  // Función para reproducir sonido de notificación
  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return

      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      // Configuración del sonido (tipo "ding" más agradable)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)

      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch (e) {
      console.error("Error al reproducir sonido:", e)
    }
  }

  // Función para activar audio manualmente (necesario por políticas del navegador)
  const activarAudio = () => {
    playNotificationSound() // Reproducir un sonido de prueba
    setAudioHabilitado(true)
  }

  // Efecto para escuchar cambios en otras pestañas (Sincronización)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'hotel-wari-habitaciones' && e.newValue) {
        try {
          const nuevasHabitaciones = JSON.parse(e.newValue)
          if (nuevasHabitaciones && Array.isArray(nuevasHabitaciones)) {
            setHabitaciones(nuevasHabitaciones)
          }
        } catch (error) {
          console.error("Error al sincronizar habitaciones:", error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Efecto para detectar nuevos pedidos y notificar al Admin
  useEffect(() => {
    if (!habitaciones || !Array.isArray(habitaciones)) return

    // Contar pedidos pendientes actuales
    const pendientesActuales = habitaciones.filter(h => h.estadoDesayuno === 'pendiente').length

    // Si hay más pendientes que antes Y el usuario es admin, sonar alarma
    if (pendientesActuales > prevPendientesRef.current) {
      if (usuarioActual?.rol === 'administrador') {
        // Intentar reproducir siempre, pero si falla es por falta de interacción
        playNotificationSound()
      }
    }

    // Actualizar referencia
    prevPendientesRef.current = pendientesActuales
  }, [habitaciones, usuarioActual])

  // Efecto para prevenir recarga accidental de la página
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = '' // Necesario para Chrome/Edge
      return '' // Necesario para otros navegadores
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // ---------------------------------------------------------------


  // Funciones de Lógica
  const manejarLogin = () => {
    const usuarioEncontrado = USUARIOS_AUTORIZADOS.find(
      u => u.usuario === nombreUsuario && u.clave === contrasena
    )

    if (usuarioEncontrado) {
      const usuarioData = {
        usuario: usuarioEncontrado.usuario,
        rol: usuarioEncontrado.rol
      }

      setUsuarioActual(usuarioData)
      setEstaAutenticado(true)
      localStorage.setItem('hotel-wari-usuario', JSON.stringify(usuarioData))

      // Redirigir según el rol
      if (usuarioEncontrado.rol === 'administrador') {
        setVistaActual('facturacion') // Dueño va directo a ver ganancias
      } else {
        setVistaActual('tablero') // Recepcionista va al dashboard
      }
    } else {
      alert('Credenciales incorrectas')
    }
  }

  // Función de búsqueda de cliente por DNI
  const buscarClientePorDNI = (dni) => {
    return clientes.find(cliente => cliente.dni === dni)
  }

  // Manejador de cambio de DNI con autocomplete
  const manejarCambioDNI = (e) => {
    const dni = e.target.value
    setDniHuesped(dni)

    // Buscar automáticamente cuando tenga 8 dígitos
    if (dni.length === 8) {
      const clienteEncontrado = buscarClientePorDNI(dni)
      if (clienteEncontrado) {
        setNombreHuesped(clienteEncontrado.nombre)
      }
    }
  }

  // Manejador de blur en campo DNI
  const manejarBlurDNI = () => {
    if (dniHuesped.length === 8) {
      const clienteEncontrado = buscarClientePorDNI(dniHuesped)
      if (clienteEncontrado) {
        setNombreHuesped(clienteEncontrado.nombre)
      }
    }
  }

  // Función de Auditoría (NUEVO - Módulo 1)
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
      accion: accion, // 'check-in', 'check-out', 'limpieza', 'amenities', 'lavanderia', 'tienda', 'venta'
      detalles: detalles,
      habitacion: extras.habitacion || null,
      monto: extras.monto || null
    }

    setHistorialAuditoria(prevHistorial => [registroAuditoria, ...prevHistorial])
  }

  const manejarRegistro = () => {
    if (!nombreHuesped || !dniHuesped || !habitacionSeleccionada || !duracionEstadia) {
      alert('Por favor complete todos los campos')
      return
    }

    // Validar que la habitación esté disponible
    const habitacion = habitaciones.find(h => h.numero === habitacionSeleccionada)
    if (!habitacion || habitacion.estado !== 'libre') {
      alert('Esa habitación no está disponible actualmente')
      return
    }

    // Agregar cliente a la base de datos si no existe
    const clienteExiste = clientes.some(c => c.dni === dniHuesped)
    if (!clienteExiste) {
      setClientes(prevClientes => [
        ...prevClientes,
        { dni: dniHuesped, nombre: nombreHuesped }
      ])
    }

    const ahora = new Date()
    const cadenaHora = `${ahora.getHours()}:${ahora.getMinutes().toString().padStart(2, '0')}`
    const fechaActual = ahora.toLocaleDateString('es-PE')
    const costoCalculado = PRECIOS_HABITACION[habitacion.tipo] * parseInt(duracionEstadia)

    // NUEVO: Crear registro en historial de check-ins
    const nuevoCheckIn = {
      id: Date.now(),
      numeroHabitacion: habitacionSeleccionada,
      tipoHabitacion: habitacion.tipo,
      nombreHuesped: nombreHuesped,
      dniHuesped: dniHuesped,
      fechaCheckIn: fechaActual,
      horaCheckIn: cadenaHora,
      fechaCheckOut: null,
      horaCheckOut: null,
      duracionEstadia: `${duracionEstadia} noches`,
      costoTotal: costoCalculado,
      metodoPago: metodoPagoRegistro,
      estado: 'activo'
    }
    setHistorialCheckIns(prevHistorial => [nuevoCheckIn, ...prevHistorial])

    // AUDITORÍA: Registrar check-in
    registrarAuditoria(
      'check-in',
      `Check-in de ${nombreHuesped} en habitación ${habitacionSeleccionada} (${habitacion.tipo})`,
      { habitacion: habitacionSeleccionada, monto: costoCalculado }
    )

    const habitacionesActualizadas = habitaciones.map(habitacion => {
      if (habitacion.numero === habitacionSeleccionada) {
        return {
          ...habitacion,
          estado: 'ocupado',
          nombreHuesped: nombreHuesped,
          dniHuesped: dniHuesped,
          horaEntrada: cadenaHora,
          duracionEstadia: `${duracionEstadia} noches`,
          costoTotal: costoCalculado,
          metodoPago: metodoPagoRegistro,
          checkInId: nuevoCheckIn.id // Guardar ID del check-in para referencia
        }
      }
      return habitacion
    })

    setHabitaciones(habitacionesActualizadas)
    // Limpiar formulario
    setNombreHuesped('')
    setDniHuesped('')
    setHabitacionSeleccionada('')
    setDuracionEstadia('')
    setMetodoPagoRegistro('Paga al finalizar estadía')
    setVistaActual('habitaciones')
  }

  const solicitarSalida = (numeroHabitacion) => {
    const habitacion = habitaciones.find(h => h.numero === numeroHabitacion)
    if (habitacion && habitacion.metodoPago) {
      setMetodoPagoSeleccionado(habitacion.metodoPago)
    } else {
      setMetodoPagoSeleccionado('Paga al finalizar estadía')
    }
    setHabitacionParaSalida(numeroHabitacion)
    setMostrarModalSalida(true)
  }

  const confirmarSalida = () => {
    if (!habitacionParaSalida) return

    // PASO 1: Encontrar la habitación y guardar en historial de ventas
    const habitacionSaliente = habitaciones.find(h => h.numero === habitacionParaSalida)

    if (habitacionSaliente && habitacionSaliente.nombreHuesped) {
      const ahora = new Date()
      const fechaSalida = ahora.toLocaleDateString('es-PE')
      const horaSalida = `${ahora.getHours()}:${ahora.getMinutes().toString().padStart(2, '0')}`

      // NUEVO: Actualizar registro en historial de check-ins
      if (habitacionSaliente.checkInId) {
        setHistorialCheckIns(prevHistorial =>
          prevHistorial.map(checkIn => {
            if (checkIn.id === habitacionSaliente.checkInId && checkIn.estado === 'activo') {
              return {
                ...checkIn,
                fechaCheckOut: fechaSalida,
                horaCheckOut: horaSalida,
                estado: 'finalizado'
              }
            }
            return checkIn
          })
        )
      } else {
        // Si no tiene checkInId (datos antiguos), buscar por habitación y estado activo
        setHistorialCheckIns(prevHistorial => {
          const checkInActivo = prevHistorial.find(
            c => c.numeroHabitacion === habitacionSaliente.numero && c.estado === 'activo'
          )

          if (checkInActivo) {
            return prevHistorial.map(checkIn => {
              if (checkIn.id === checkInActivo.id) {
                return {
                  ...checkIn,
                  fechaCheckOut: fechaSalida,
                  horaCheckOut: horaSalida,
                  estado: 'finalizado'
                }
              }
              return checkIn
            })
          }
          return prevHistorial
        })
      }

      // MÓDULO 3: Calcular total con todos los servicios
      const consumos = consumosHabitaciones[habitacionSaliente.numero] || { lavanderia: [], tienda: [], desayunos: null }

      const totalLavanderia = consumos.lavanderia.reduce((sum, item) => sum + item.subtotal, 0)
      const totalTienda = consumos.tienda.reduce((sum, item) => sum + item.subtotal, 0)
      const totalDesayunos = habitacionSaliente.desayuno && habitacionSaliente.cantidadDesayunos
        ? habitacionSaliente.cantidadDesayunos * 10
        : 0

      const costoHabitacion = habitacionSaliente.costoTotal || 0
      const costoTotalFinal = costoHabitacion + totalLavanderia + totalTienda + totalDesayunos

      const registroVenta = {
        id: Date.now(), // ID único basado en timestamp
        numeroHabitacion: habitacionSaliente.numero,
        tipoHabitacion: habitacionSaliente.tipo,
        nombreHuesped: habitacionSaliente.nombreHuesped,
        dniHuesped: habitacionSaliente.dniHuesped || 'N/A',
        horaEntrada: habitacionSaliente.horaEntrada,
        horaSalida: horaSalida,
        fechaSalida: fechaSalida,
        duracionEstadia: habitacionSaliente.duracionEstadia,
        costoHabitacion: costoHabitacion,
        // NUEVO: Desglose de servicios adicionales
        serviciosLavanderia: consumos.lavanderia,
        totalLavanderia: totalLavanderia,
        serviciosTienda: consumos.tienda,
        totalTienda: totalTienda,
        cantidadDesayunos: habitacionSaliente.cantidadDesayunos || 0,
        totalDesayunos: totalDesayunos,
        costoTotal: costoTotalFinal,
        metodoPago: metodoPagoSeleccionado
      }

      // Agregar al historial (más recientes primero)
      setHistorialVentas(prevHistorial => [registroVenta, ...prevHistorial])

      // Limpiar consumos de la habitación
      setConsumosHabitaciones(prev => {
        const nuevo = { ...prev }
        delete nuevo[habitacionSaliente.numero]
        return nuevo
      })

      // AUDITORÍA: Registrar check-out
      registrarAuditoria(
        'check-out',
        `Check-out de ${habitacionSaliente.nombreHuesped} de habitación ${habitacionSaliente.numero}`,
        { habitacion: habitacionSaliente.numero, monto: costoTotalFinal }
      )
    }

    // PASO 2: Pasar habitación a estado LIMPIEZA (no libre)
    const habitacionesActualizadas = habitaciones.map(habitacion => {
      if (habitacion.numero === habitacionParaSalida) {
        // Resetear habitación a estado LIMPIEZA y limpiar datos del huésped
        return {
          numero: habitacion.numero,
          tipo: habitacion.tipo,
          piso: habitacion.piso,
          estado: 'limpieza'  // ← Cambio clave: pasa a limpieza, no a libre
        }
      }
      return habitacion
    })

    // PASO 3: Actualizar estado y guardar en localStorage
    setHabitaciones(habitacionesActualizadas)
    localStorage.setItem('hotel-wari-habitaciones', JSON.stringify(habitacionesActualizadas))

    // Cerrar modal y limpiar estado
    setMostrarModalSalida(false)
    setHabitacionParaSalida(null)
    setMetodoPagoSeleccionado('Paga al finalizar estadía')
  }

  const cancelarSalida = () => {
    setMostrarModalSalida(false)
    setHabitacionParaSalida(null)
    setMetodoPagoSeleccionado('Paga al finalizar estadía')
  }

  const terminarLimpieza = (numeroHabitacion) => {
    const habitacionesActualizadas = habitaciones.map(habitacion => {
      if (habitacion.numero === numeroHabitacion) {
        return {
          ...habitacion,
          estado: 'libre'
        }
      }
      return habitacion
    })

    setHabitaciones(habitacionesActualizadas)
    localStorage.setItem('hotel-wari-habitaciones', JSON.stringify(habitacionesActualizadas))

    // AUDITORÍA: Registrar limpieza completada
    registrarAuditoria(
      'limpieza',
      `Limpieza completada en habitación ${numeroHabitacion}`,
      { habitacion: numeroHabitacion }
    )
  }

  const ajustarStock = (id, cambio) => {
    setInventario(prevInventario =>
      prevInventario.map(item => {
        if (item.id === id) {
          const nuevaCantidad = Math.max(0, item.cantidad + cambio)
          return { ...item, cantidad: nuevaCantidad }
        }
        return item
      })
    )
  }

  // Funciones de Servicios Adicionales (NUEVO - Módulo 2)
  const agregarConsumoLavanderia = (numeroHabitacion, itemId, cantidad) => {
    const item = catalogoLavanderia.find(i => i.id === itemId)
    if (!item) return

    setConsumosHabitaciones(prev => {
      const consumosHab = prev[numeroHabitacion] || { lavanderia: [], tienda: [], desayunos: null }

      // Verificar si el ítem ya existe en lavandería
      const existente = consumosHab.lavanderia.find(c => c.itemId === itemId)

      let nuevaLavanderia
      if (existente) {
        // Actualizar cantidad
        nuevaLavanderia = consumosHab.lavanderia.map(c =>
          c.itemId === itemId
            ? { ...c, cantidad: c.cantidad + cantidad, subtotal: (c.cantidad + cantidad) * c.precioUnitario }
            : c
        )
      } else {
        // Agregar nuevo ítem
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

    // AUDITORÍA: Registrar servicio de lavandería
    registrarAuditoria(
      'lavanderia',
      `Servicio de lavandería agregado a habitación ${numeroHabitacion}: ${cantidad}x ${item.nombre}`,
      { habitacion: numeroHabitacion, monto: item.precio * cantidad }
    )
  }

  const agregarConsumoTienda = (numeroHabitacion, itemId, cantidad) => {
    const item = catalogoTienda.find(i => i.id === itemId)
    if (!item) return

    // Verificar stock disponible
    if (item.stock < cantidad) {
      alert(`Stock insuficiente de ${item.nombre}. Disponible: ${item.stock}`)
      return
    }

    // Descontar del stock
    setCatalogoTienda(prevCatalogo =>
      prevCatalogo.map(i =>
        i.id === itemId
          ? { ...i, stock: i.stock - cantidad }
          : i
      )
    )

    setConsumosHabitaciones(prev => {
      const consumosHab = prev[numeroHabitacion] || { lavanderia: [], tienda: [], desayunos: null }

      // Verificar si el ítem ya existe en tienda
      const existente = consumosHab.tienda.find(c => c.itemId === itemId)

      let nuevaTienda
      if (existente) {
        // Actualizar cantidad
        nuevaTienda = consumosHab.tienda.map(c =>
          c.itemId === itemId
            ? { ...c, cantidad: c.cantidad + cantidad, subtotal: (c.cantidad + cantidad) * c.precioUnitario }
            : c
        )
      } else {
        // Agregar nuevo ítem
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

    // AUDITORÍA: Registrar venta de tienda
    registrarAuditoria(
      'tienda',
      `Producto de tienda agregado a habitación ${numeroHabitacion}: ${cantidad}x ${item.nombre}`,
      { habitacion: numeroHabitacion, monto: item.precio * cantidad }
    )
  }

  // Función para procesar ingresos diarios
  const procesarIngresosDiarios = () => {
    const ingresosPorFecha = {}

    historialVentas.forEach(venta => {
      const fecha = venta.fechaSalida
      if (!ingresosPorFecha[fecha]) {
        ingresosPorFecha[fecha] = 0
      }
      ingresosPorFecha[fecha] += venta.costoTotal || 0
    })

    return Object.entries(ingresosPorFecha)
      .map(([fecha, ingresos]) => ({ fecha, ingresos }))
      .sort((a, b) => {
        // Ordenar por fecha (asumiendo formato dd/mm/yyyy)
        const [diaA, mesA, anioA] = a.fecha.split('/')
        const [diaB, mesB, anioB] = b.fecha.split('/')
        const fechaA = new Date(anioA || 2024, mesA - 1, diaA)
        const fechaB = new Date(anioB || 2024, mesB - 1, diaB)
        return fechaA - fechaB
      })
  }

  // Funciones de Historial de Check-Ins
  const filtrarHistorialCheckIns = () => {
    let historialFiltrado = [...historialCheckIns]

    // Filtrar por habitación
    if (filtroHabitacion) {
      historialFiltrado = historialFiltrado.filter(c => c.numeroHabitacion === filtroHabitacion)
    }

    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      historialFiltrado = historialFiltrado.filter(c => c.estado === filtroEstado)
    }

    // Filtrar por rango de fechas
    if (filtroFechaInicio) {
      historialFiltrado = historialFiltrado.filter(c => {
        const fechaCheckIn = new Date(c.fechaCheckIn.split('/').reverse().join('-'))
        const fechaInicio = new Date(filtroFechaInicio)
        return fechaCheckIn >= fechaInicio
      })
    }

    if (filtroFechaFin) {
      historialFiltrado = historialFiltrado.filter(c => {
        const fechaCheckIn = new Date(c.fechaCheckIn.split('/').reverse().join('-'))
        const fechaFin = new Date(filtroFechaFin)
        return fechaCheckIn <= fechaFin
      })
    }

    return historialFiltrado
  }

  const generarReporteTexto = () => {
    const historialFiltrado = filtrarHistorialCheckIns()
    const totalIngresos = historialFiltrado.reduce((sum, c) => sum + (c.costoTotal || 0), 0)

    let reporte = '=== REPORTE DE CHECK-INS/CHECK-OUTS ===\n\n'
    reporte += `Fecha de generación: ${new Date().toLocaleDateString('es-PE')} ${new Date().toLocaleTimeString('es-PE')}\n`
    reporte += `Total de registros: ${historialFiltrado.length}\n`
    reporte += `Ingresos totales: S/ ${totalIngresos}\n\n`
    reporte += '--- DETALLE ---\n\n'

    historialFiltrado.forEach((checkIn, index) => {
      reporte += `${index + 1}. Habitación ${checkIn.numeroHabitacion} (${checkIn.tipoHabitacion})\n`
      reporte += `   Huésped: ${checkIn.nombreHuesped} (DNI: ${checkIn.dniHuesped})\n`
      reporte += `   Check-In: ${checkIn.fechaCheckIn} ${checkIn.horaCheckIn}\n`
      if (checkIn.fechaCheckOut) {
        reporte += `   Check-Out: ${checkIn.fechaCheckOut} ${checkIn.horaCheckOut}\n`
      } else {
        reporte += `   Check-Out: AÚN HOSPEDADO\n`
      }
      reporte += `   Estadía: ${checkIn.duracionEstadia}\n`
      reporte += `   Costo: S/ ${checkIn.costoTotal}\n`
      reporte += `   Pago: ${checkIn.metodoPago}\n`
      reporte += `   Estado: ${checkIn.estado === 'activo' ? 'ACTIVO' : 'FINALIZADO'}\n\n`
    })

    return reporte
  }

  const enviarReportePorWhatsApp = () => {
    const reporte = generarReporteTexto()
    const mensaje = encodeURIComponent(reporte)
    const url = `https://wa.me/?text=${mensaje}`
    window.open(url, '_blank')
  }

  const descargarReporte = () => {
    const reporte = generarReporteTexto()
    const blob = new Blob([reporte], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte-checkins-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Funciones de Mensajería
  const enviarMensaje = () => {
    if (!nuevoMensaje.trim()) {
      alert('Por favor escribe un mensaje')
      return
    }

    const mensaje = {
      id: Date.now(),
      remitente: usuarioActual.usuario,
      rolRemitente: usuarioActual.rol,
      contenido: nuevoMensaje,
      fecha: new Date().toLocaleDateString('es-PE'),
      hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      leido: false
    }

    setMensajes(prevMensajes => [mensaje, ...prevMensajes])
    setNuevoMensaje('')
  }

  const eliminarMensaje = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
      setMensajes(prevMensajes => prevMensajes.filter(m => m.id !== id))
    }
  }

  const marcarMensajesComoLeidos = () => {
    setMensajes(prevMensajes =>
      prevMensajes.map(mensaje => {
        // Solo marcar como leídos los mensajes que NO fueron enviados por el usuario actual
        if (mensaje.remitente !== usuarioActual.usuario) {
          return { ...mensaje, leido: true }
        }
        return mensaje
      })
    )
  }

  const contarMensajesNoLeidos = () => {
    return mensajes.filter(mensaje =>
      !mensaje.leido && mensaje.remitente !== usuarioActual?.usuario
    ).length
  }

  // Funciones de Desayuno
  const toggleDesayuno = (numeroHabitacion) => {
    const habitacionesActualizadas = habitaciones.map(habitacion => {
      if (habitacion.numero === numeroHabitacion) {
        const nuevoEstadoDesayuno = !habitacion.desayuno
        const cantidad = habitacion.cantidadDesayunos || 1

        // Recalcular costo
        const costoBase = PRECIOS_HABITACION[habitacion.tipo] * parseInt(habitacion.duracionEstadia.split(' ')[0])
        const costoDesayuno = nuevoEstadoDesayuno ? (cantidad * 20) : 0

        return {
          ...habitacion,
          desayuno: nuevoEstadoDesayuno,
          cantidadDesayunos: cantidad,
          estadoDesayuno: nuevoEstadoDesayuno ? 'pendiente' : null,
          costoTotal: costoBase + costoDesayuno
        }
      }
      return habitacion
    })

    setHabitaciones(habitacionesActualizadas)
    localStorage.setItem('hotel-wari-habitaciones', JSON.stringify(habitacionesActualizadas))
  }

  const cambiarCantidadDesayuno = (numeroHabitacion, cambio) => {
    const habitacionesActualizadas = habitaciones.map(habitacion => {
      if (habitacion.numero === numeroHabitacion) {
        // Solo permitir cambios si está pendiente
        if (habitacion.estadoDesayuno !== 'pendiente') return habitacion

        const nuevaCantidad = Math.max(1, (habitacion.cantidadDesayunos || 1) + cambio)

        // Recalcular costo
        const costoBase = PRECIOS_HABITACION[habitacion.tipo] * parseInt(habitacion.duracionEstadia.split(' ')[0])
        const costoDesayuno = habitacion.desayuno ? (nuevaCantidad * 20) : 0

        return {
          ...habitacion,
          cantidadDesayunos: nuevaCantidad,
          costoTotal: costoBase + costoDesayuno
        }
      }
      return habitacion
    })

    setHabitaciones(habitacionesActualizadas)
    localStorage.setItem('hotel-wari-habitaciones', JSON.stringify(habitacionesActualizadas))
  }

  const confirmarPedido = (numeroHabitacion) => {
    const habitacionesActualizadas = habitaciones.map(habitacion => {
      if (habitacion.numero === numeroHabitacion) {
        return { ...habitacion, estadoDesayuno: 'confirmado' }
      }
      return habitacion
    })
    setHabitaciones(habitacionesActualizadas)
    localStorage.setItem('hotel-wari-habitaciones', JSON.stringify(habitacionesActualizadas))
  }

  const gestionarPedidoAdmin = (numeroHabitacion, nuevoEstado) => {
    const habitacionesActualizadas = habitaciones.map(habitacion => {
      if (habitacion.numero === numeroHabitacion) {
        if (nuevoEstado === 'cancelado') {
          // Si se cancela, quitamos el desayuno y recalculamos costo
          const costoBase = PRECIOS_HABITACION[habitacion.tipo] * parseInt(habitacion.duracionEstadia.split(' ')[0])
          return {
            ...habitacion,
            desayuno: false,
            estadoDesayuno: null,
            costoTotal: costoBase
          }
        }
        return { ...habitacion, estadoDesayuno: nuevoEstado }
      }
      return habitacion
    })
    setHabitaciones(habitacionesActualizadas)
    localStorage.setItem('hotel-wari-habitaciones', JSON.stringify(habitacionesActualizadas))
  }

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

    // Descontar stock de amenities
    const nuevosAmenities = amenities.map(producto => {
      const entrega = itemsAEntregar.find(i => i.id === producto.id)
      if (entrega) {
        return { ...producto, cantidad: producto.cantidad - entrega.cantidad }
      }
      return producto
    })
    setAmenities(nuevosAmenities)

    // **NUEVO: Descontar del inventario general**
    // Mapeo de amenities a inventario:
    // Jabones (amenity id:1) → Inventario id:2
    // Shampoo (amenity id:2) → Inventario id:5
    const mapeoAmenitiesInventario = {
      1: 2, // Jabones
      2: 5  // Shampoo
    }

    itemsAEntregar.forEach(item => {
      const idInventario = mapeoAmenitiesInventario[item.id]
      if (idInventario) {
        // Descontar del inventario (cantidad negativa)
        ajustarStock(idInventario, -item.cantidad)
      }
    })

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

    // AUDITORÍA: Registrar entrega de amenities
    const detallesAmenities = itemsAEntregar
      .map(item => {
        const prod = amenities.find(p => p.id === item.id)
        return `${prod?.nombre}: ${item.cantidad}`
      })
      .join(', ')

    registrarAuditoria(
      'amenities',
      `Entrega de amenities a habitación ${habitacionEntrega}: ${detallesAmenities}`,
      { habitacion: habitacionEntrega }
    )

    // Limpiar formulario
    setHabitacionEntrega('')
    setCantidadesEntrega({})
    alert('Entrega registrada correctamente. El inventario se ha actualizado automáticamente.')
  }

  const cerrarSesion = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      setEstaAutenticado(false)
      setUsuarioActual(null)
      setNombreUsuario('')
      setContrasena('')
      setVistaActual('tablero')
      localStorage.removeItem('hotel-wari-usuario')
    }
  }

  // Componente Interno: Menú de Navegación
  const MenuNavegacion = () => {
    return (
      <nav className="navbar-principal">
        <div className="navbar-enlaces">
          <button
            className={`navbar-enlace ${vistaActual === 'tablero' ? 'activo' : ''}`}
            onClick={() => setVistaActual('tablero')}
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Panel</span>
          </button>
          <button
            className={`navbar-enlace ${vistaActual === 'habitaciones' ? 'activo' : ''}`}
            onClick={() => setVistaActual('habitaciones')}
          >
            <FontAwesomeIcon icon={faBed} />
            <span>Habitaciones</span>
          </button>
          {usuarioActual?.rol === 'recepcionista' && (
            <>
              <button
                className={`navbar-enlace ${vistaActual === 'registro' ? 'activo' : ''}`}
                onClick={() => setVistaActual('registro')}
              >
                <FontAwesomeIcon icon={faUserPlus} />
                <span>Registro</span>
              </button>
              <button
                className={`navbar-enlace ${vistaActual === 'desayunos' ? 'activo' : ''}`}
                onClick={() => setVistaActual('desayunos')}
              >
                <FontAwesomeIcon icon={faCoffee} />
                <span>Desayunos</span>
              </button>
            </>
          )}
          {usuarioActual?.rol === 'administrador' && (
            <>
              <button
                className={`navbar-enlace ${vistaActual === 'facturacion' ? 'activo' : ''}`}
                onClick={() => setVistaActual('facturacion')}
              >
                <FontAwesomeIcon icon={faReceipt} />
                <span>Facturación</span>
              </button>
              <button
                className={`navbar-enlace ${vistaActual === 'desayunos' ? 'activo' : ''}`}
                onClick={() => setVistaActual('desayunos')}
              >
                <FontAwesomeIcon icon={faCoffee} />
                <span>Desayunos</span>
              </button>
            </>
          )}
          <button
            className={`navbar-enlace ${vistaActual === 'inventario' ? 'activo' : ''}`}
            onClick={() => setVistaActual('inventario')}
          >
            <FontAwesomeIcon icon={faBoxes} />
            <span>Inventario</span>
          </button>
          <button
            className={`navbar-enlace ${vistaActual === 'amenities' ? 'activo' : ''}`}
            onClick={() => setVistaActual('amenities')}
          >
            <FontAwesomeIcon icon={faPumpSoap} />
            <span>Usos Diarios en el Hotel</span>
          </button>
          <button
            className={`navbar-enlace ${vistaActual === 'servicios' ? 'activo' : ''}`}
            onClick={() => setVistaActual('servicios')}
          >
            <FontAwesomeIcon icon={faShoppingCart} />
            <span>Servicios Adicionales</span>
          </button>
          <button
            className={`navbar-enlace ${vistaActual === 'mensajes' ? 'activo' : ''}`}
            onClick={() => {
              setVistaActual('mensajes')
              marcarMensajesComoLeidos()
            }}
          >
            <FontAwesomeIcon icon={faComments} />
            <span>Mensajes</span>
            {contarMensajesNoLeidos() > 0 && (
              <span className="badge-mensajes">{contarMensajesNoLeidos()}</span>
            )}
          </button>
          <button
            className={`navbar-enlace ${vistaActual === 'auditoria' ? 'activo' : ''}`}
            onClick={() => setVistaActual('auditoria')}
          >
            <FontAwesomeIcon icon={faClipboardList} />
            <span>Historial de Movimientos</span>
          </button>
        </div>
        <button className="boton-cerrar-sesion" onClick={cerrarSesion}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Cerrar Sesión</span>
        </button>
      </nav>
    )
  }

  // Componente Interno: Modal de Imagen Ampliada
  const ModalImagen = ({ src, alCerrar }) => {
    if (!src) return null;
    return (
      <div className="superposicion-modal-imagen" onClick={alCerrar}>
        <div className="contenido-modal-imagen" onClick={e => e.stopPropagation()}>
          <button className="boton-cerrar-imagen" onClick={alCerrar}>X</button>
          <img src={src} alt="Vista ampliada de la habitación" />
        </div>
      </div>
    );
  };

  // Renderizado Principal
  if (estaAutenticado) {
    // Renderizar contenido de cada vista
    let contenidoVista

    // Vista de Habitaciones
    if (vistaActual === 'habitaciones') {
      contenidoVista = (
        <div className="contenedor-habitaciones">
          <h1 className="titulo-habitaciones">Habitaciones</h1>

          {/* Piso 2 */}
          <div className="seccion-piso">
            <h2>Piso 2</h2>
            <div className="cuadricula-habitaciones">
              {habitaciones.filter(h => h.piso === 2).map(habitacion => {
                // Lógica de estados
                const estaOcupado = habitacion.estado === 'ocupado' && habitacion.nombreHuesped
                const estaEnLimpieza = habitacion.estado === 'limpieza'
                const estaLibre = habitacion.estado === 'libre'

                // Determinar clase de estado
                let claseEstado = 'estado-libre'
                if (estaOcupado) claseEstado = 'estado-ocupado'
                if (estaEnLimpieza) claseEstado = 'estado-limpieza'

                return (
                  <div key={habitacion.numero} className={`tarjeta-habitacion ${claseEstado}`}>
                    <div className="encabezado-habitacion">
                      <div className="info-habitacion">
                        <span className="numero-habitacion">{habitacion.numero}</span>
                        <span className="tipo-habitacion">{habitacion.tipo}</span>
                      </div>
                      <img
                        src={IMAGENES_HABITACION[habitacion.tipo]}
                        alt={`Habitación ${habitacion.tipo}`}
                        className="miniatura-habitacion"
                        onClick={() => setImagenAmpliada(IMAGENES_HABITACION[habitacion.tipo])}
                        title="Click para ampliar"
                      />
                    </div>

                    {estaOcupado && (
                      <div className="detalles-huesped">
                        <p><strong>Huésped:</strong> {habitacion.nombreHuesped}</p>
                        <p><strong>Ingreso:</strong> {habitacion.horaEntrada}</p>
                        <p><strong>Estadía:</strong> {habitacion.duracionEstadia}</p>
                        {habitacion.costoTotal && <p><strong>Total:</strong> S/ {habitacion.costoTotal}</p>}
                        {habitacion.metodoPago && <p><strong>Pago:</strong> {habitacion.metodoPago}</p>}
                        {usuarioActual?.rol === 'recepcionista' && (
                          <button className="boton-salida" onClick={() => solicitarSalida(habitacion.numero)}>Finalizar Estadía</button>
                        )}
                      </div>
                    )}

                    {estaEnLimpieza && (
                      <div className="detalles-limpieza">
                        <p><strong>En Limpieza</strong></p>
                        <button className="boton-limpieza" onClick={() => terminarLimpieza(habitacion.numero)}>Terminar Limpieza</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Piso 3 */}
          <div className="seccion-piso">
            <h2>Piso 3</h2>
            <div className="cuadricula-habitaciones">
              {habitaciones.filter(h => h.piso === 3).map(habitacion => {
                // Lógica de estados
                const estaOcupado = habitacion.estado === 'ocupado' && habitacion.nombreHuesped
                const estaEnLimpieza = habitacion.estado === 'limpieza'
                const estaLibre = habitacion.estado === 'libre'

                // Determinar clase de estado
                let claseEstado = 'estado-libre'
                if (estaOcupado) claseEstado = 'estado-ocupado'
                if (estaEnLimpieza) claseEstado = 'estado-limpieza'

                return (
                  <div key={habitacion.numero} className={`tarjeta-habitacion ${claseEstado}`}>
                    <div className="encabezado-habitacion">
                      <div className="info-habitacion">
                        <span className="numero-habitacion">{habitacion.numero}</span>
                        <span className="tipo-habitacion">{habitacion.tipo}</span>
                      </div>
                      <img
                        src={IMAGENES_HABITACION[habitacion.tipo]}
                        alt={`Habitación ${habitacion.tipo}`}
                        className="miniatura-habitacion"
                        onClick={() => setImagenAmpliada(IMAGENES_HABITACION[habitacion.tipo])}
                        title="Click para ampliar"
                      />
                    </div>

                    {estaOcupado && (
                      <div className="detalles-huesped">
                        <p><strong>Huésped:</strong> {habitacion.nombreHuesped}</p>
                        <p><strong>Ingreso:</strong> {habitacion.horaEntrada}</p>
                        <p><strong>Estadía:</strong> {habitacion.duracionEstadia}</p>
                        {habitacion.costoTotal && <p><strong>Total:</strong> S/ {habitacion.costoTotal}</p>}
                        {habitacion.metodoPago && <p><strong>Pago:</strong> {habitacion.metodoPago}</p>}
                        {usuarioActual?.rol === 'recepcionista' && (
                          <button className="boton-salida" onClick={() => solicitarSalida(habitacion.numero)}>Finalizar Estadía</button>
                        )}
                      </div>
                    )}

                    {estaEnLimpieza && (
                      <div className="detalles-limpieza">
                        <p><strong>En Limpieza</strong></p>
                        <button className="boton-limpieza" onClick={() => terminarLimpieza(habitacion.numero)}>Terminar Limpieza</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Renderizado de Modales */}
          {imagenAmpliada && (
            <ModalImagen src={imagenAmpliada} alCerrar={() => setImagenAmpliada(null)} />
          )}

          {mostrarModalSalida && (
            <div className="superposicion-modal" onClick={cancelarSalida}>
              <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                <h2 className="titulo-modal">Confirmar Salida</h2>
                <p className="mensaje-modal">
                  ¿Deseas finalizar la estadía y liberar esta habitación?
                  <br />
                  <span className="mensaje-despedida">¡Esperamos verles pronto de nuevo!</span>
                </p>
                {(() => {
                  const habitacion = habitaciones.find(h => h.numero === habitacionParaSalida)
                  const yaPago = habitacion && habitacion.metodoPago && (habitacion.metodoPago === 'Tarjeta' || habitacion.metodoPago === 'Yape/Plin' || habitacion.metodoPago === 'Transferencia')

                  if (yaPago) {
                    return (
                      <div className="mensaje-pago-realizado">
                        <p> Pago ya realizado: <strong>{habitacion.metodoPago}</strong></p>
                      </div>
                    )
                  } else {
                    return (
                      <div className="grupo-metodo-pago">
                        <label htmlFor="metodo-pago">M�todo de Pago:</label>
                        <select
                          id="metodo-pago"
                          className="selector-metodo-pago"
                          value={metodoPagoSeleccionado}
                          onChange={(e) => setMetodoPagoSeleccionado(e.target.value)}
                        >
                          <option value="Paga al finalizar estad�a">Paga al finalizar estad�a</option>
                          <option value="Efectivo">Efectivo</option>
                          <option value="Tarjeta">Tarjeta</option>
                          <option value="Yape/Plin">Yape/Plin</option>
                          <option value="Transferencia">Transferencia</option>
                        </select>
                      </div>
                    )
                  }
                })()}
                <div className="acciones-modal">
                  <button className="boton-cancelar-modal" onClick={cancelarSalida}>Cancelar</button>
                  <button className="boton-confirmar-modal" onClick={confirmarSalida}>Confirmar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    // Vista de Registro
    else if (vistaActual === 'registro') {
      contenidoVista = (
        <div className="contenedor-registro">
          <h1 className="titulo-registro">Registrar Huésped</h1>
          <div className="formulario-registro">
            <div className="grupo-formulario-horizontal">
              <label>DNI</label>
              <input
                type="text"
                value={dniHuesped}
                onChange={manejarCambioDNI}
                onBlur={manejarBlurDNI}
                placeholder="Ej: 12345678"
                maxLength="8"
              />
            </div>
            <div className="grupo-formulario-horizontal">
              <label>Nombre Completo</label>
              <input
                type="text"
                value={nombreHuesped}
                onChange={(e) => setNombreHuesped(e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div className="grupo-formulario-horizontal">
              <label>Habitación</label>
              <select value={habitacionSeleccionada} onChange={(e) => setHabitacionSeleccionada(e.target.value)}>
                <option value="">Seleccione una habitación</option>
                {habitaciones
                  .filter(h => h.estado === 'libre')
                  .map(habitacion => (
                    <option key={habitacion.numero} value={habitacion.numero}>
                      {habitacion.numero} - {habitacion.tipo} (Piso {habitacion.piso})
                    </option>
                  ))}
              </select>
            </div>
            <div className="grupo-formulario-horizontal">
              <label>Estadía (noches)</label>
              <input type="number" value={duracionEstadia} onChange={(e) => setDuracionEstadia(e.target.value)} placeholder="Ej: 2" min="1" />
            </div>
            <div className="grupo-formulario-horizontal">
              <label>M�todo de Pago</label>
              <select
                value={metodoPagoRegistro}
                onChange={(e) => setMetodoPagoRegistro(e.target.value)}
              >
                <option value="Paga al finalizar estad�a">Paga al finalizar estad�a</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Yape/Plin">Yape/Plin</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>

            {/* Previsualización del Costo */}
            {habitacionSeleccionada && duracionEstadia && (
              <div className="resumen-costo">
                <strong>Total Estimado: </strong>
                S/ {PRECIOS_HABITACION[habitaciones.find(h => h.numero === habitacionSeleccionada).tipo] * parseInt(duracionEstadia)}
              </div>
            )}

            <div className="acciones-formulario">
              <button className="boton-cancelar" onClick={() => setVistaActual('tablero')}>Cancelar</button>
              <button className="boton-guardar" onClick={manejarRegistro}>Registrar</button>
            </div>
          </div>
        </div>
      )
    }

    // Vista de Facturación
    else if (vistaActual === 'facturacion') {
      const totalAcumulado = historialVentas.reduce((sum, venta) => sum + (venta.costoTotal || 0), 0)
      contenidoVista = (
        <div className="contenedor-facturacion">
          <h1 className="titulo-facturacion">Historial de Facturación</h1>

          {historialVentas.length === 0 ? (
            <div className="mensaje-sin-datos">
              <p>No hay registros de ventas aún.</p>
              <p>Los checkouts aparecerán aquí automáticamente.</p>
            </div>
          ) : (
            <>
              <div className="resumen-total">
                <strong>Total Acumulado:</strong> S/ {totalAcumulado}
                <span className="contador-ventas">({historialVentas.length} {historialVentas.length === 1 ? 'venta' : 'ventas'})</span>
              </div>

              <div className="contenedor-tabla">
                <table className="tabla-facturacion">
                  <thead>
                    <tr>
                      <th>Fecha Salida</th>
                      <th>Hora Salida</th>
                      <th>Habitación</th>
                      <th>Tipo</th>
                      <th>Huésped</th>
                      <th>DNI</th>
                      <th>Estadía</th>
                      <th>M�todo de Pago</th>
                      <th>Total (S/)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialVentas.map(venta => (
                      <tr key={venta.id}>
                        <td>{venta.fechaSalida}</td>
                        <td>{venta.horaSalida}</td>
                        <td><strong>{venta.numeroHabitacion}</strong></td>
                        <td>{venta.tipoHabitacion}</td>
                        <td>{venta.nombreHuesped}</td>
                        <td>{venta.dniHuesped}</td>
                        <td><span className="metodo-pago-badge">{venta.metodoPago || 'N/A'}</span></td>
                        <td>{venta.duracionEstadia}</td>
                        <td className="celda-total"><strong>S/ {venta.costoTotal}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )
    }

    // Vista de Inventario
    else if (vistaActual === 'inventario') {
      contenidoVista = (
        <div className="contenedor-inventario">
          <h1 className="titulo-inventario">Gestión de Inventario</h1>

          <div className="contenedor-tabla">
            <table className="tabla-inventario">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Cantidad en Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventario.map(item => {
                  const stockBajo = item.cantidad < 5
                  return (
                    <tr key={item.id} className={stockBajo ? 'fila-alerta' : ''}>
                      <td><strong>{item.producto}</strong></td>
                      <td>{item.categoria}</td>
                      <td className={stockBajo ? 'stock-bajo' : 'stock-normal'}>
                        {item.cantidad}
                      </td>
                      <td>
                        {stockBajo ? (
                          <span className="etiqueta-alerta">¡Stock Bajo!</span>
                        ) : (
                          <span className="etiqueta-ok">Normal</span>
                        )}
                      </td>
                      <td>
                        <div className="botones-stock">
                          <button
                            className="boton-decrementar"
                            onClick={() => ajustarStock(item.id, -1)}
                            disabled={item.cantidad === 0}
                            title="Decrementar"
                          >
                            -
                          </button>
                          <button
                            className="boton-incrementar"
                            onClick={() => ajustarStock(item.id, 1)}
                            title="Incrementar"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    // Vista de Desayunos
    else if (vistaActual === 'desayunos') {
      const habitacionesOcupadas = habitaciones.filter(h => h.estado === 'ocupado')

      // Filtrar para admin: solo mostrar si tienen desayuno solicitado (o todos si se prefiere)
      const habitacionesAmostrar = usuarioActual.rol === 'administrador'
        ? habitacionesOcupadas.filter(h => h.desayuno)
        : habitacionesOcupadas

      contenidoVista = (
        <div className="contenedor-desayunos">
          <h1 className="titulo-desayunos">Servicio de Desayuno</h1>
          <p className="subtitulo-desayunos">
            {usuarioActual.rol === 'administrador'
              ? 'Gestión de pedidos de desayuno'
              : 'Solicitud de desayunos para huéspedes'}
          </p>

          {usuarioActual.rol === 'administrador' && !audioHabilitado && (
            <div className="alerta-activar-audio" style={{ marginBottom: '15px', textAlign: 'center' }}>
              <button
                onClick={activarAudio}
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  margin: '0 auto'
                }}
              >
                🔔 Activar Sonido de Notificaciones
              </button>
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                (Necesario para escuchar nuevos pedidos)
              </p>
            </div>
          )}

          <div className="cuadricula-desayunos">
            {habitacionesAmostrar.length === 0 ? (
              <div className="mensaje-vacio">
                <p>No hay solicitudes pendientes.</p>
              </div>
            ) : (
              habitacionesAmostrar.map(habitacion => (
                <div key={habitacion.numero} className={`tarjeta-desayuno ${habitacion.desayuno ? 'con-desayuno' : ''}`}>
                  <div className="encabezado-desayuno">
                    <span className="numero-hab">Habitación {habitacion.numero}</span>
                    <span className={`estado-servicio ${habitacion.estadoDesayuno ? `badge-estado-${habitacion.estadoDesayuno}` : ''}`}>
                      {habitacion.desayuno
                        ? (habitacion.estadoDesayuno === 'pendiente' ? 'Pendiente de Confirmar'
                          : habitacion.estadoDesayuno === 'confirmado' ? 'Confirmado'
                            : 'En Preparación')
                        : 'Sin Servicio'}
                    </span>
                  </div>

                  <div className="info-huesped-desayuno">
                    <p><strong>Huésped:</strong> {habitacion.nombreHuesped}</p>
                    <p><strong>Personas:</strong> {habitacion.tipo === 'Simple' ? '1' : habitacion.tipo === 'Doble' ? '2' : '3-4'}</p>
                  </div>

                  <div className="controles-desayuno">
                    {habitacion.desayuno ? (
                      <div className="control-cantidad">
                        <p>Cantidad de Desayunos:</p>

                        {/* Controles de cantidad: Solo editables por recepcionista si está pendiente */}
                        <div className="botones-cantidad">
                          {usuarioActual.rol === 'recepcionista' && habitacion.estadoDesayuno === 'pendiente' && (
                            <button
                              onClick={() => cambiarCantidadDesayuno(habitacion.numero, -1)}
                              disabled={habitacion.cantidadDesayunos <= 1}
                            >
                              -
                            </button>
                          )}

                          <span>{habitacion.cantidadDesayunos || 1}</span>

                          {usuarioActual.rol === 'recepcionista' && habitacion.estadoDesayuno === 'pendiente' && (
                            <button onClick={() => cambiarCantidadDesayuno(habitacion.numero, 1)}>+</button>
                          )}
                        </div>

                        <p className="costo-desayuno">
                          Costo adicional: S/ {(habitacion.cantidadDesayunos || 1) * 20}
                        </p>

                        {/* Acciones para Recepcionista */}
                        {usuarioActual.rol === 'recepcionista' && (
                          <>
                            {habitacion.estadoDesayuno === 'pendiente' ? (
                              <div className="acciones-recepcion">
                                <button
                                  className="boton-confirmar-pedido"
                                  onClick={() => confirmarPedido(habitacion.numero)}
                                >
                                  Confirmar Pedido
                                </button>
                                <button
                                  className="boton-quitar-desayuno"
                                  onClick={() => toggleDesayuno(habitacion.numero)}
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <p className="mensaje-info">Pedido enviado a cocina</p>
                            )}
                          </>
                        )}

                        {/* Acciones para Administrador */}
                        {usuarioActual.rol === 'administrador' && (
                          <div className="acciones-admin">
                            {habitacion.estadoDesayuno === 'confirmado' && (
                              <button
                                className="boton-aceptar-pedido"
                                onClick={() => gestionarPedidoAdmin(habitacion.numero, 'preparando')}
                              >
                                Aceptar / Preparar
                              </button>
                            )}
                            <button
                              className="boton-cancelar-pedido-admin"
                              onClick={() => {
                                if (window.confirm('¿Cancelar este pedido de desayuno?')) {
                                  gestionarPedidoAdmin(habitacion.numero, 'cancelado')
                                }
                              }}
                            >
                              Cancelar Pedido
                            </button>
                          </div>
                        )}

                      </div>
                    ) : (
                      /* Solo recepcionista puede iniciar pedidos */
                      usuarioActual.rol === 'recepcionista' && (
                        <button
                          className="boton-agregar-desayuno"
                          onClick={() => toggleDesayuno(habitacion.numero)}
                        >
                          <FontAwesomeIcon icon={faCoffee} /> Agregar Desayuno
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )
    }

    // Vista de Mensajería
    else if (vistaActual === 'mensajes') {
      contenidoVista = (
        <div className="contenedor-mensajeria">
          <h1 className="titulo-mensajeria">Mensajería Interna</h1>
          <p className="subtitulo-mensajeria">
            Comunicación entre Recepción y Administración
          </p>

          <div className="contenedor-chat">
            <div className="lista-mensajes">
              {mensajes.length === 0 ? (
                <div className="mensaje-vacio">
                  <p>No hay mensajes aún.</p>
                  <p>Envía el primer mensaje para comenzar la conversación.</p>
                </div>
              ) : (
                mensajes.map(mensaje => {
                  const esMensajePropio = mensaje.remitente === usuarioActual.usuario
                  return (
                    <div
                      key={mensaje.id}
                      className={`mensaje-item ${esMensajePropio ? 'mensaje-propio' : 'mensaje-ajeno'}`}
                    >
                      <div className="mensaje-encabezado">
                        <span className="mensaje-remitente">
                          {esMensajePropio ? 'Tú' : mensaje.remitente}
                          {!esMensajePropio && (
                            <span className="mensaje-rol">
                              ({mensaje.rolRemitente === 'administrador' ? 'Administrador' : 'Recepcionista'})
                            </span>
                          )}
                        </span>
                        <span className="mensaje-fecha">
                          {mensaje.fecha} - {mensaje.hora}
                          {esMensajePropio && (
                            <button
                              className="boton-eliminar-mensaje"
                              onClick={() => eliminarMensaje(mensaje.id)}
                              title="Eliminar mensaje"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                        </span>
                      </div>
                      <div className="mensaje-contenido">
                        {mensaje.contenido}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="formulario-mensaje">
              <textarea
                className="input-mensaje"
                placeholder="Escribe tu mensaje aquí..."
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    enviarMensaje()
                  }
                }}
                rows="3"
              />
              <button className="boton-enviar-mensaje" onClick={enviarMensaje}>
                Enviar Mensaje
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Vista de Historial de Auditoría (NUEVO - Módulo 1)
    else if (vistaActual === 'auditoria') {
      // Filtrar historial de auditoría
      const filtrarAuditoria = () => {
        return historialAuditoria.filter(registro => {
          // Filtro por tipo de acción
          if (filtroAuditoriaTipo !== 'todos' && registro.accion !== filtroAuditoriaTipo) {
            return false
          }

          // Filtro por usuario
          if (filtroAuditoriaUsuario && !registro.usuario.toLowerCase().includes(filtroAuditoriaUsuario.toLowerCase())) {
            return false
          }

          // Filtro por habitación
          if (filtroAuditoriaHabitacion && registro.habitacion !== filtroAuditoriaHabitacion) {
            return false
          }

          // Filtro por rango de fechas
          if (filtroAuditoriaFechaInicio || filtroAuditoriaFechaFin) {
            const fechaRegistro = new Date(registro.fecha.split('/').reverse().join('-'))

            if (filtroAuditoriaFechaInicio) {
              const fechaInicio = new Date(filtroAuditoriaFechaInicio)
              if (fechaRegistro < fechaInicio) return false
            }

            if (filtroAuditoriaFechaFin) {
              const fechaFin = new Date(filtroAuditoriaFechaFin)
              if (fechaRegistro > fechaFin) return false
            }
          }

          return true
        })
      }

      const registrosFiltrados = filtrarAuditoria()

      // Función para obtener color de badge según tipo de acción
      const obtenerColorBadge = (accion) => {
        const colores = {
          'check-in': '#2ecc71',
          'check-out': '#e74c3c',
          'limpieza': '#f39c12',
          'amenities': '#9b59b6',
          'lavanderia': '#3498db',
          'tienda': '#1abc9c',
          'venta': '#e67e22'
        }
        return colores[accion] || '#95a5a6'
      }

      contenidoVista = (
        <div className="contenedor-auditoria">
          <h1 className="titulo-auditoria">Historial de Movimientos</h1>
          <p className="subtitulo-auditoria">
            Registro completo de todas las acciones realizadas en el sistema
          </p>

          {/* Filtros */}
          <div className="panel-filtros-auditoria">
            <div className="grupo-filtro">
              <label>Fecha Inicio:</label>
              <input
                type="date"
                value={filtroAuditoriaFechaInicio}
                onChange={(e) => setFiltroAuditoriaFechaInicio(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grupo-filtro">
              <label>Fecha Fin:</label>
              <input
                type="date"
                value={filtroAuditoriaFechaFin}
                onChange={(e) => setFiltroAuditoriaFechaFin(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grupo-filtro">
              <label>Tipo de Acción:</label>
              <select
                value={filtroAuditoriaTipo}
                onChange={(e) => setFiltroAuditoriaTipo(e.target.value)}
              >
                <option value="todos">Todas</option>
                <option value="check-in">Check-In</option>
                <option value="check-out">Check-Out</option>
                <option value="limpieza">Limpieza</option>
                <option value="amenities">Amenities</option>
                <option value="lavanderia">Lavandería</option>
                <option value="tienda">Tienda</option>
                <option value="venta">Venta</option>
              </select>
            </div>

            <div className="grupo-filtro">
              <label>Usuario:</label>
              <input
                type="text"
                placeholder="Buscar por usuario..."
                value={filtroAuditoriaUsuario}
                onChange={(e) => setFiltroAuditoriaUsuario(e.target.value)}
              />
            </div>

            <div className="grupo-filtro">
              <label>Habitación:</label>
              <input
                type="text"
                placeholder="Ej: 201"
                value={filtroAuditoriaHabitacion}
                onChange={(e) => setFiltroAuditoriaHabitacion(e.target.value)}
              />
            </div>

            <button
              className="boton-limpiar-filtros"
              onClick={() => {
                setFiltroAuditoriaFechaInicio('')
                setFiltroAuditoriaFechaFin('')
                setFiltroAuditoriaTipo('todos')
                setFiltroAuditoriaUsuario('')
                setFiltroAuditoriaHabitacion('')
              }}
            >
              Limpiar Filtros
            </button>
          </div>

          {/* Tabla de Auditoría */}
          <div className="tabla-auditoria-container">
            <p className="contador-registros">
              Mostrando {registrosFiltrados.length} de {historialAuditoria.length} registros
            </p>

            {registrosFiltrados.length === 0 ? (
              <div className="mensaje-sin-registros">
                <p>No se encontraron registros con los filtros aplicados</p>
              </div>
            ) : (
              <table className="tabla-auditoria">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Acción</th>
                    <th>Detalles</th>
                    <th>Habitación</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.map(registro => (
                    <tr key={registro.id}>
                      <td>{registro.fecha}</td>
                      <td>{registro.hora}</td>
                      <td>{registro.usuario}</td>
                      <td>
                        <span className={`badge-rol ${registro.rol}`}>
                          {registro.rol}
                        </span>
                      </td>
                      <td>
                        <span
                          className="badge-accion"
                          style={{ backgroundColor: obtenerColorBadge(registro.accion) }}
                        >
                          {registro.accion}
                        </span>
                      </td>
                      <td className="celda-detalles">{registro.detalles}</td>
                      <td>{registro.habitacion || '-'}</td>
                      <td>{registro.monto ? `S/ ${registro.monto}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )
    }

    // Vista de Servicios Adicionales (NUEVO - Módulo 2)
    else if (vistaActual === 'servicios') {
      const habitacionesOcupadas = habitaciones.filter(h => h.estado === 'ocupado')
      const consumosActuales = habitacionServicio ? (consumosHabitaciones[habitacionServicio] || { lavanderia: [], tienda: [], desayunos: null }) : null

      const calcularTotalConsumos = () => {
        if (!consumosActuales) return 0
        const totalLav = consumosActuales.lavanderia.reduce((sum, item) => sum + item.subtotal, 0)
        const totalTienda = consumosActuales.tienda.reduce((sum, item) => sum + item.subtotal, 0)
        return totalLav + totalTienda
      }

      contenidoVista = (
        <div className="contenedor-servicios">
          <h1 className="titulo-servicios">Servicios Adicionales</h1>
          <p className="subtitulo-servicios">
            Agregar servicios de lavandería y tienda a habitaciones ocupadas
          </p>

          <div className="panel-selector-habitacion">
            <label>Seleccionar Habitación Ocupada:</label>
            <select
              value={habitacionServicio}
              onChange={(e) => {
                setHabitacionServicio(e.target.value)
                setCantidadesLavanderia({})
                setCantidadesTienda({})
              }}
            >
              <option value="">-- Seleccione una habitación --</option>
              {habitacionesOcupadas.map(hab => (
                <option key={hab.numero} value={hab.numero}>
                  Habitación {hab.numero} - {hab.nombreHuesped}
                </option>
              ))}
            </select>
          </div>

          {habitacionServicio && (
            <>
              <div className="tabs-servicios">
                <button
                  className={`tab-servicio ${tabServicioActivo === 'lavanderia' ? 'activo' : ''}`}
                  onClick={() => setTabServicioActivo('lavanderia')}
                >
                  <FontAwesomeIcon icon={faTshirt} /> Lavandería
                </button>
                <button
                  className={`tab-servicio ${tabServicioActivo === 'tienda' ? 'activo' : ''}`}
                  onClick={() => setTabServicioActivo('tienda')}
                >
                  <FontAwesomeIcon icon={faShoppingCart} /> Tienda/Enseres
                </button>
              </div>

              <div className="contenido-tab-servicios">
                {tabServicioActivo === 'lavanderia' && (
                  <div className="panel-lavanderia">
                    <h3>Catálogo de Lavandería</h3>
                    <div className="grid-items-servicio">
                      {catalogoLavanderia.map(item => (
                        <div key={item.id} className="tarjeta-item-servicio">
                          <div className="info-item-servicio">
                            <h4>{item.nombre}</h4>
                            <p className="precio-item">S/ {item.precio.toFixed(2)}</p>
                          </div>
                          <div className="controles-cantidad">
                            <button onClick={() => {
                              const nuevaCantidad = Math.max(0, (cantidadesLavanderia[item.id] || 0) - 1)
                              setCantidadesLavanderia(prev => ({ ...prev, [item.id]: nuevaCantidad }))
                            }}>-</button>
                            <input
                              type="number"
                              min="0"
                              value={cantidadesLavanderia[item.id] || 0}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0)
                                setCantidadesLavanderia(prev => ({ ...prev, [item.id]: val }))
                              }}
                            />
                            <button onClick={() => {
                              setCantidadesLavanderia(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }))
                            }}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      className="boton-agregar-servicio"
                      onClick={() => {
                        const itemsAgregar = Object.entries(cantidadesLavanderia).filter(([_, cant]) => cant > 0)
                        if (itemsAgregar.length === 0) {
                          alert('Selecciona al menos un ítem')
                          return
                        }
                        itemsAgregar.forEach(([id, cantidad]) => {
                          agregarConsumoLavanderia(habitacionServicio, parseInt(id), cantidad)
                        })
                        setCantidadesLavanderia({})
                        alert('Servicios de lavandería agregados correctamente')
                      }}
                    >
                      Agregar a Habitación {habitacionServicio}
                    </button>
                  </div>
                )}

                {tabServicioActivo === 'tienda' && (
                  <div className="panel-tienda">
                    <h3>Catálogo de Tienda/Enseres</h3>
                    <div className="grid-items-servicio">
                      {catalogoTienda.map(item => (
                        <div key={item.id} className="tarjeta-item-servicio">
                          <div className="info-item-servicio">
                            <h4>{item.nombre}</h4>
                            <p className="precio-item">S/ {item.precio.toFixed(2)}</p>
                            <p className={`stock-item ${item.stock < 10 ? 'stock-bajo' : ''}`}>
                              Stock: {item.stock}
                            </p>
                          </div>
                          <div className="controles-cantidad">
                            <button onClick={() => {
                              const nuevaCantidad = Math.max(0, (cantidadesTienda[item.id] || 0) - 1)
                              setCantidadesTienda(prev => ({ ...prev, [item.id]: nuevaCantidad }))
                            }}>-</button>
                            <input
                              type="number"
                              min="0"
                              max={item.stock}
                              value={cantidadesTienda[item.id] || 0}
                              onChange={(e) => {
                                const val = Math.min(item.stock, Math.max(0, parseInt(e.target.value) || 0))
                                setCantidadesTienda(prev => ({ ...prev, [item.id]: val }))
                              }}
                            />
                            <button onClick={() => {
                              const actual = cantidadesTienda[item.id] || 0
                              if (actual < item.stock) {
                                setCantidadesTienda(prev => ({ ...prev, [item.id]: actual + 1 }))
                              }
                            }}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      className="boton-agregar-servicio"
                      onClick={() => {
                        const itemsAgregar = Object.entries(cantidadesTienda).filter(([_, cant]) => cant > 0)
                        if (itemsAgregar.length === 0) {
                          alert('Selecciona al menos un ítem')
                          return
                        }
                        itemsAgregar.forEach(([id, cantidad]) => {
                          agregarConsumoTienda(habitacionServicio, parseInt(id), cantidad)
                        })
                        setCantidadesTienda({})
                        alert('Productos de tienda agregados correctamente')
                      }}
                    >
                      Agregar a Habitación {habitacionServicio}
                    </button>
                  </div>
                )}
              </div>

              <div className="panel-resumen-consumos">
                <h3>Resumen de Consumos - Habitación {habitacionServicio}</h3>

                {consumosActuales.lavanderia.length > 0 && (
                  <div className="seccion-resumen">
                    <h4><FontAwesomeIcon icon={faTshirt} /> Lavandería</h4>
                    <table className="tabla-resumen-consumos">
                      <thead>
                        <tr>
                          <th>Ítem</th>
                          <th>Cantidad</th>
                          <th>Precio Unit.</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consumosActuales.lavanderia.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.nombre}</td>
                            <td>{item.cantidad}</td>
                            <td>S/ {item.precioUnitario.toFixed(2)}</td>
                            <td>S/ {item.subtotal.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {consumosActuales.tienda.length > 0 && (
                  <div className="seccion-resumen">
                    <h4><FontAwesomeIcon icon={faShoppingCart} /> Tienda/Enseres</h4>
                    <table className="tabla-resumen-consumos">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio Unit.</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consumosActuales.tienda.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.nombre}</td>
                            <td>{item.cantidad}</td>
                            <td>S/ {item.precioUnitario.toFixed(2)}</td>
                            <td>S/ {item.subtotal.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {consumosActuales.lavanderia.length === 0 && consumosActuales.tienda.length === 0 && (
                  <p className="mensaje-sin-consumos">No hay consumos registrados para esta habitación</p>
                )}

                <div className="total-consumos">
                  <strong>Total Servicios Adicionales:</strong> S/ {calcularTotalConsumos().toFixed(2)}
                </div>
              </div>
            </>
          )}

          {!habitacionServicio && (
            <div className="mensaje-seleccionar-habitacion">
              <p>Selecciona una habitación ocupada para agregar servicios</p>
            </div>
          )}
        </div>
      )
    }


    // Vista de Usos Diarios (Amenities)
    else if (vistaActual === 'amenities') {
      contenidoVista = (
        <div className="contenedor-amenities">
          <h1 className="titulo-amenities">Usos Diarios en el Hotel</h1>

          <div className="panel-amenities">
            <div className="panel-stock-formulario">
              <div className="tarjeta-stock-amenities">
                <h2>Stock Disponible</h2>
                <div className="grid-stock-amenities">
                  {amenities.map(item => (
                    <div key={item.id} className={`item-stock-amenity ${item.cantidad < 10 ? 'stock-bajo' : ''}`}>
                      <span className="nombre-amenity">{item.nombre}</span>
                      <span className="cantidad-amenity">{item.cantidad}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulario de entrega - SOLO para recepcionistas */}
              {usuarioActual?.rol === 'recepcionista' && (
                <div className="tarjeta-entrega-amenities">
                  <h2>Registrar Entrega a Habitación</h2>
                  <div className="formulario-entrega">
                    <div className="campo-formulario">
                      <label>Habitación:</label>
                      <select
                        value={habitacionEntrega}
                        onChange={(e) => setHabitacionEntrega(e.target.value)}
                        className="select-habitacion-amenity"
                      >
                        <option value="">Seleccionar...</option>
                        {habitaciones.map(h => (
                          <option key={h.numero} value={h.numero}>
                            Habitación {h.numero} ({h.estado})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="lista-seleccion-amenities">
                      <p>Selecciona cantidades:</p>
                      {amenities.map(item => (
                        <div key={item.id} className="fila-seleccion-amenity">
                          <label>{item.nombre}:</label>
                          <input
                            type="number"
                            min="0"
                            max={item.cantidad}
                            value={cantidadesEntrega[item.id] || ''}
                            onChange={(e) => manejarCambioCantidad(item.id, e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>

                    <button className="boton-registrar-entrega" onClick={registrarEntregaAmenities}>
                      Registrar Entrega
                    </button>
                  </div>
                </div>
              )}

              {/* Mensaje para administradores */}
              {usuarioActual?.rol === 'administrador' && (
                <div className="tarjeta-entrega-amenities">
                  <h2>Vista de Solo Lectura</h2>
                  <div className="formulario-entrega">
                    <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      Como administrador, solo puedes visualizar el stock y el historial de entregas.
                      <br />
                      Para registrar entregas, inicia sesión como recepcionista.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="panel-historial-amenities">
              <h2>Historial de Entregas</h2>
              <div className="tabla-historial-container">
                <table className="tabla-historial-amenities">
                  <thead>
                    <tr>
                      <th>Fecha/Hora</th>
                      <th>Habitación</th>
                      <th>Productos Entregados</th>
                      <th>Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialAmenities.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No hay entregas registradas</td>
                      </tr>
                    ) : (
                      historialAmenities.map(registro => (
                        <tr key={registro.id}>
                          <td>
                            <div className="fecha-hora">
                              <span>{registro.fecha}</span>
                              <small>{registro.hora}</small>
                            </div>
                          </td>
                          <td><strong>{registro.habitacion}</strong></td>
                          <td>
                            <ul className="lista-items-entregados">
                              {registro.items.map((item, idx) => (
                                <li key={idx}>{item.cantidad}x {item.nombre}</li>
                              ))}
                            </ul>
                          </td>
                          <td>{registro.responsable}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Vista del Tablero (Dashboard)
    else {
      const datosIngresos = procesarIngresosDiarios()

      contenidoVista = (
        <div className="contenedor-tablero">
          <div className="encabezado-tablero">
            <img src={fachadaImg} alt="Fachada Hotel Wari" className="imagen-fachada" />
            <h1 className="titulo-tablero">Panel de Control</h1>
            {usuarioActual && (
              <p className="mensaje-bienvenida">
                Bienvenido, {usuarioActual.rol === 'administrador' ? 'Administrador' : 'Recepcionista'}
              </p>
            )}
          </div>

          {/* Sección de Resumen de Ingresos */}
          {usuarioActual?.rol === 'administrador' && datosIngresos.length > 0 && (
            <div className="seccion-resumen-ingresos">
              <h2>Resumen de Ingresos</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datosIngresos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ingresos" fill="#8b5cf6" name="Ingresos (S/)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="cuadricula-menu">
            <div className="tarjeta-menu" onClick={() => setVistaActual('habitaciones')}>
              <FontAwesomeIcon icon={faBed} className="icono-menu" />
              <h3>Ver Habitaciones</h3>
              <p>Estado actual y ocupación</p>
            </div>
            {usuarioActual?.rol === 'recepcionista' && (
              <div className="tarjeta-menu" onClick={() => setVistaActual('registro')}>
                <FontAwesomeIcon icon={faUserPlus} className="icono-menu" />
                <h3>Registrar Huésped</h3>
                <p>Ingreso de nuevos clientes</p>
              </div>
            )}
            {usuarioActual?.rol === 'administrador' && (
              <div className="tarjeta-menu" onClick={() => setVistaActual('facturacion')}>
                <FontAwesomeIcon icon={faReceipt} className="icono-menu" />
                <h3>Facturación</h3>
                <p>Historial de pagos</p>
              </div>
            )}
            <div className="tarjeta-menu" onClick={() => setVistaActual('inventario')}>
              <FontAwesomeIcon icon={faBoxes} className="icono-menu" />
              <h3>Inventario</h3>
              <p>Control de stock</p>
            </div>
            <div className="tarjeta-menu" onClick={() => setVistaActual('amenities')}>
              <FontAwesomeIcon icon={faPumpSoap} className="icono-menu" />
              <h3>Usos Diarios en el Hotel</h3>
              <p>Entrega de productos</p>
            </div>
          </div>
        </div>
      )
    }


    // Renderizar con navbar y contenido
    return (
      <>
        <MenuNavegacion />
        <div className="contenido-principal">
          {contenidoVista}
        </div>
      </>
    )
  }

  // Vista de Login (Inicio de Sesión)
  return (
    <div className="contenedor-app">
      {!mostrarLogin ? (
        <>
          <h1 className="titulo-bienvenida">Bienvenido al Sistema Hotel Wari</h1>
          <button className="boton-ingresar" onClick={() => setMostrarLogin(true)}>Ingresar</button>
        </>
      ) : (
        <div className="formulario-login">
          <h2 className="titulo-login">Iniciar Sesión</h2>
          <div className="grupo-login-horizontal">
            <input type="text" placeholder="Usuario" className="input-login" value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} />
            <input type="password" placeholder="Contraseña" className="input-login" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
          </div>
          <button className="boton-entrar" onClick={manejarLogin}>Entrar</button>
        </div>
      )}
    </div>
  )
}
export default App



