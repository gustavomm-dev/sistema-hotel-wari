import re

# Leer el archivo
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Agregar estados de amenities después de useEffect de mensajes
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

# Buscar el patrón y agregar los estados
pattern = r"(  }, \[mensajes\])\r?\n\r?\n(  // --- Lógica de Sincronización)"
replacement = r"\1" + estados_amenities + r"\n\2"
content = re.sub(pattern, replacement, content)

# Guardar
with open('src/App.jsx', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print("Estados de amenities agregados correctamente")
