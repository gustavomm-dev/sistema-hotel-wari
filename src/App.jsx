import { useState, useEffect } from 'react'
import './App.css'
import fachadaImg from './assets/fachada.jpg'
import simpleImg from './assets/simple.jpg'
import dobleImg from './assets/doble.jpg'
import familiarImg from './assets/familiar.jpg'

const ROOM_PRICES = {
  'Simple': 100,
  'Doble': 120,
  'Familiar': 180
}

const ROOM_IMAGES = {
  'Simple': simpleImg,
  'Doble': dobleImg,
  'Familiar': familiarImg
}

function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [currentView, setCurrentView] = useState('dashboard')

  // Registration Form State
  const [guestName, setGuestName] = useState('')
  const [guestDni, setGuestDni] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [stayDuration, setStayDuration] = useState('')

  // Modal State
  const [modalImage, setModalImage] = useState(null)

  const [rooms, setRooms] = useState(() => {
    const savedRooms = localStorage.getItem('hotel-wari-rooms')
    if (savedRooms) {
      return JSON.parse(savedRooms)
    }
    return [
      // Piso 2
      { number: '201', type: 'Simple', floor: 2, status: 'libre' },
      { number: '202', type: 'Simple', floor: 2, status: 'ocupado', guestName: 'Juan Pérez', entryTime: '14:30', stayDuration: '2 noches' },
      { number: '203', type: 'Doble', floor: 2, status: 'libre' },
      { number: '204', type: 'Simple', floor: 2, status: 'libre' },
      { number: '205', type: 'Simple', floor: 2, status: 'ocupado' },
      { number: '206', type: 'Simple', floor: 2, status: 'libre' },
      { number: '207', type: 'Doble', floor: 2, status: 'ocupado', guestName: 'Maria Garcia', entryTime: '10:00', stayDuration: '1 noche' },
      { number: '208', type: 'Familiar', floor: 2, status: 'libre' },
      // Piso 3
      { number: '301', type: 'Simple', floor: 3, status: 'libre' },
      { number: '302', type: 'Simple', floor: 3, status: 'libre' },
      { number: '303', type: 'Simple', floor: 3, status: 'ocupado' },
      { number: '304', type: 'Simple', floor: 3, status: 'libre' },
      { number: '305', type: 'Simple', floor: 3, status: 'ocupado', guestName: 'Carlos Lopez', entryTime: '18:45', stayDuration: '3 noches' },
      { number: '306', type: 'Simple', floor: 3, status: 'libre' },
      { number: '307', type: 'Simple', floor: 3, status: 'ocupado' },
      { number: '308', type: 'Simple', floor: 3, status: 'libre' },
      { number: '309', type: 'Simple', floor: 3, status: 'libre' },
    ]
  })

  useEffect(() => {
    localStorage.setItem('hotel-wari-rooms', JSON.stringify(rooms))
  }, [rooms])

  const handleLogin = () => {
    if (username === 'admin' && password === '1234') {
      setIsLoggedIn(true)
      setCurrentView('dashboard')
    } else {
      alert('Credenciales incorrectas')
    }
  }

  const handleRegister = () => {
    if (!guestName || !guestDni || !selectedRoom || !stayDuration) {
      alert('Por favor complete todos los campos')
      return
    }

    const updatedRooms = rooms.map(room => {
      if (room.number === selectedRoom) {
        const now = new Date()
        const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
        const totalCost = ROOM_PRICES[room.type] * parseInt(stayDuration)
        return {
          ...room,
          status: 'ocupado',
          guestName: guestName,
          entryTime: timeString,
          stayDuration: `${stayDuration} noches`,
          totalCost: totalCost
        }
      }
      return room
    })

    setRooms(updatedRooms)

    // Reset form
    setGuestName('')
    setGuestDni('')
    setSelectedRoom('')
    setStayDuration('')

    setCurrentView('rooms')
  }

  const handleCheckout = (roomNumber) => {
    if (window.confirm('¿Confirmar salida?')) {
      const updatedRooms = rooms.map(room => {
        if (room.number === roomNumber) {
          return {
            number: room.number,
            type: room.type,
            floor: room.floor,
            status: 'libre'
          }
        }
        return room
      })
      setRooms(updatedRooms)
    }
  }

  if (isLoggedIn) {
    if (currentView === 'rooms') {
      return (
        <div className="rooms-container">
          <h1 className="rooms-title">Habitaciones</h1>

          <div className="floor-section">
            <h2>Piso 2</h2>
            <div className="rooms-grid">
              {rooms.filter(r => r.floor === 2).map(room => (
                <div key={room.number} className={`room-card status-${room.status}`}>
                  <div className="room-header">
                    <div className="room-info">
                      <span className="room-number">{room.number}</span>
                      <span className="room-type">{room.type}</span>
                    </div>
                    <img src={ROOM_IMAGES[room.type]} alt={room.type} className="room-thumbnail" />
                  </div>
                  {room.status === 'ocupado' && room.guestName && (
                    <div className="guest-details">
                      <p><strong>Huésped:</strong> {room.guestName}</p>
                      <p><strong>Ingreso:</strong> {room.entryTime}</p>
                      <p><strong>Estadía:</strong> {room.stayDuration}</p>
                      {room.totalCost && <p><strong>Costo Total:</strong> S/ {room.totalCost}</p>}
                      <button className="checkout-button" onClick={() => handleCheckout(room.number)}>Finalizar Estadía</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="floor-section">
            <h2>Piso 3</h2>
            <div className="rooms-grid">
              {rooms.filter(r => r.floor === 3).map(room => (
                <div key={room.number} className={`room-card status-${room.status}`}>
                  <div className="room-header">
                    <div className="room-info">
                      <span className="room-number">{room.number}</span>
                      <span className="room-type">{room.type}</span>
                    </div>
                    <img src={ROOM_IMAGES[room.type]} alt={room.type} className="room-thumbnail" />
                  </div>
                  {room.status === 'ocupado' && room.guestName && (
                    <div className="guest-details">
                      <p><strong>Huésped:</strong> {room.guestName}</p>
                      <p><strong>Ingreso:</strong> {room.entryTime}</p>
                      <p><strong>Estadía:</strong> {room.stayDuration}</p>
                      {room.totalCost && <p><strong>Costo Total:</strong> S/ {room.totalCost}</p>}
                      <button className="checkout-button" onClick={() => handleCheckout(room.number)}>Finalizar Estadía</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button className="back-button" onClick={() => setCurrentView('dashboard')}>Volver</button>
        </div>
      )
    }

    if (currentView === 'register') {
      return (
        <div className="register-container">
          <h1 className="register-title">Registrar Huésped</h1>
          <div className="register-form">
            <div className="form-group">
              <label>Nombre Completo</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="form-group">
              <label>DNI</label>
              <input
                type="text"
                value={guestDni}
                onChange={(e) => setGuestDni(e.target.value)}
                placeholder="Ej: 12345678"
              />
            </div>

            <div className="form-group">
              <label>Habitación</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
              >
                <option value="">Seleccione una habitación</option>
                {rooms.filter(r => r.status === 'libre').map(room => (
                  <option key={room.number} value={room.number}>
                    {room.number} - {room.type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tiempo de Estadía (noches)</label>
              <input
                type="number"
                value={stayDuration}
                onChange={(e) => setStayDuration(e.target.value)}
                placeholder="Ej: 2"
                min="1"
              />
            </div>

            <div className="form-actions">
              <button className="cancel-button" onClick={() => setCurrentView('dashboard')}>Cancelar</button>
              <button className="save-button" onClick={handleRegister}>Guardar</button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <img src={fachadaImg} alt="Hotel Wari Fachada" className="hotel-facade" />
          <h1 className="dashboard-title">Panel de Control</h1>
        </div>
        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={() => setCurrentView('rooms')}>
            <h3>Ver Habitaciones</h3>
          </div>
          <div className="dashboard-card" onClick={() => setCurrentView('register')}>
            <h3>Registrar Huésped</h3>
          </div>
          <div className="dashboard-card">
            <h3>Facturación</h3>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {!showLogin ? (
        <>
          <h1 className="welcome-title">Bienvenido al Sistema Hotel Wari</h1>
          <button className="enter-button" onClick={() => setShowLogin(true)}>Ingresar</button>
        </>
      ) : (
        <div className="login-form">
          <h2 className="login-title">Iniciar Sesión</h2>
          <input
            type="text"
            placeholder="Usuario"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="login-button" onClick={handleLogin}>Entrar</button>
        </div>
      )}
    </div>
  )
}

export default App
