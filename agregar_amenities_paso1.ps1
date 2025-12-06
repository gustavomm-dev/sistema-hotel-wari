# Script para agregar funcionalidad de Amenities al App.jsx
$filePath = "src\App.jsx"
$content = Get-Content $filePath -Raw

# 1. Agregar ícono faPumpSoap
$content = $content -replace "import \{ faBed, faUserPlus, faReceipt, faBoxes, faHome, faSignOutAlt, faComments, faTrash, faCoffee \} from '@fortawesome/free-solid-svg-icons'", "import { faBed, faUserPlus, faReceipt, faBoxes, faHome, faSignOutAlt, faComments, faTrash, faCoffee, faPumpSoap } from '@fortawesome/free-solid-svg-icons'"

# 2. Agregar estados de amenities después del useEffect de mensajes
$estadosAmenities = @"

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
"@

$content = $content -replace "(\s+)\/\/ --- Lógica de Sincronización en Tiempo Real y Notificaciones ---", "$estadosAmenities`r`n`$1// --- Lógica de Sincronización en Tiempo Real y Notificaciones ---"

# Guardar el archivo
$content | Set-Content $filePath -NoNewline

Write-Host "Paso 1 y 2 completados: Ícono y estados agregados"
