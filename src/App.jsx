import { useState, useEffect } from 'react'
import './App.css'
import fachadaImg from './assets/fachada.jpg'
import simpleImg from './assets/simple.jpg'
import dobleImg from './assets/doble.jpg'
import familiarImg from './assets/familiar.jpg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBed, faUserPlus, faReceipt, faBoxes, faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
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
  const [estaAutenticado, setEstaAutenticado] = useState(false)
  const [usuarioActual, setUsuarioActual] = useState(null) // { usuario: 'admin', rol: 'administrador' }
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [vistaActual, setVistaActual] = useState('tablero') // 'dashboard' ahora es 'tablero'

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

  // Estado Principal de Habitaciones (Estructura de Datos en Español)
  const [habitaciones, setHabitaciones] = useState(() => {
    const habitacionesGuardadas = localStorage.getItem('hotel-wari-habitaciones')
    if (habitacionesGuardadas) {
      return JSON.parse(habitacionesGuardadas)
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

  // Funciones de Lógica
  const manejarLogin = () => {
    const usuarioEncontrado = USUARIOS_AUTORIZADOS.find(
      u => u.usuario === nombreUsuario && u.clave === contrasena
    )

    if (usuarioEncontrado) {
      setUsuarioActual({
        usuario: usuarioEncontrado.usuario,
        rol: usuarioEncontrado.rol
      })
      setEstaAutenticado(true)

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

    const habitacionesActualizadas = habitaciones.map(habitacion => {
      if (habitacion.numero === habitacionSeleccionada) {
        const ahora = new Date()
        const cadenaHora = `${ahora.getHours()}:${ahora.getMinutes().toString().padStart(2, '0')}`
        const costoCalculado = PRECIOS_HABITACION[habitacion.tipo] * parseInt(duracionEstadia)

        return {
          ...habitacion,
          estado: 'ocupado',
          nombreHuesped: nombreHuesped,
          dniHuesped: dniHuesped,
          horaEntrada: cadenaHora,
          duracionEstadia: `${duracionEstadia} noches`,
          costoTotal: costoCalculado,
          metodoPago: metodoPagoRegistro
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
        costoTotal: habitacionSaliente.costoTotal
      }

      // Agregar al historial (más recientes primero)
      setHistorialVentas(prevHistorial => [registroVenta, ...prevHistorial])
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

  // Función de Cierre de Sesión
  const cerrarSesion = () => {
    setEstaAutenticado(false)
    setUsuarioActual(null)
    setNombreUsuario('')
    setContrasena('')
    setVistaActual('tablero')
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
            <button
              className={`navbar-enlace ${vistaActual === 'registro' ? 'activo' : ''}`}
              onClick={() => setVistaActual('registro')}
            >
              <FontAwesomeIcon icon={faUserPlus} />
              <span>Registro</span>
            </button>
          )}
          {usuarioActual?.rol === 'administrador' && (
            <button
              className={`navbar-enlace ${vistaActual === 'facturacion' ? 'activo' : ''}`}
              onClick={() => setVistaActual('facturacion')}
            >
              <FontAwesomeIcon icon={faReceipt} />
              <span>Facturación</span>
            </button>
          )}
          <button
            className={`navbar-enlace ${vistaActual === 'inventario' ? 'activo' : ''}`}
            onClick={() => setVistaActual('inventario')}
          >
            <FontAwesomeIcon icon={faBoxes} />
            <span>Inventario</span>
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
          {datosIngresos.length > 0 && (
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

