# Script para agregar la vista completa de amenities
$filePath = "src\App.jsx"
$content = Get-Content $filePath -Raw

# Agregar vista de amenities (después de la vista de Inventario, antes de Mensajes)
$vistaAmenities = @"

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
                    <div key={item.id} className={``item-stock-amenity "+"`${item.cantidad < 10 ? 'stock-bajo' : ''}``}>
                      <span className="nombre-amenity">{item.nombre}</span>
                      <span className="cantidad-amenity">{item.cantidad}</span>
                    </div>
                  ))}
                </div>
              </div>

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
"@

# Buscar la vista de Mensajes y agregar la vista de amenities antes
$content = $content -replace "(\s+)\/\/ Vista de Mensajería", "$vistaAmenities`r`n`$1// Vista de Mensajería"

# Guardar
$content | Set-Content $filePath -NoNewline

Write-Host "Paso 6 completado: Vista de amenities agregada"
Write-Host "¡Todos los pasos completados! Recarga el navegador con Ctrl+Shift+R"
