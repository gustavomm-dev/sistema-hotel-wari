# Script para agregar funciones de Amenities
$filePath = "src\App.jsx"
$content = Get-Content $filePath -Raw

# Agregar funciones de amenities antes de cerrarSesion
$funcionesAmenities = @"

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
        alert(`+"``No hay suficiente stock de "+"`${producto.nombre}`"+``)
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
"@

$content = $content -replace "(\s+)const cerrarSesion = \(\) => \{", "$funcionesAmenities`r`n`$1const cerrarSesion = () => {"

# Guardar
$content | Set-Content $filePath -NoNewline

Write-Host "Paso 3 completado: Funciones agregadas"
