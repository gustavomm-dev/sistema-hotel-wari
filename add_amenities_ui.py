import re

# Leer el archivo
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Buscar las líneas donde agregar código
output = []
i = 0
while i < len(lines):
    output.append(lines[i])
    
    # 1. Agregar botón en menú después del botón de Inventario
    if '<span>Inventario</span>' in lines[i] and i + 1 < len(lines) and '</button>' in lines[i+1]:
        output.append(lines[i+1])  # </button>
        i += 1
        # Agregar botón de amenities
        output.append('          <button\n')
        output.append("            className={`navbar-enlace ${vistaActual === 'amenities' ? 'activo' : ''}`}\n")
        output.append("            onClick={() => setVistaActual('amenities')}\n")
        output.append('          >\n')
        output.append('            <FontAwesomeIcon icon={faPumpSoap} />\n')
        output.append('            <span>Usos Diarios en el Hotel</span>\n')
        output.append('          </button>\n')
    
    # 2. Agregar tarjeta en dashboard después de tarjeta de Inventario
    elif '<p>Control de stock</p>' in lines[i] and i + 1 < len(lines) and '</div>' in lines[i+1]:
        output.append(lines[i+1])  # </div>
        i += 1
        # Agregar tarjeta de amenities
        output.append("            <div className=\"tarjeta-menu\" onClick={() => setVistaActual('amenities')}>\n")
        output.append('              <FontAwesomeIcon icon={faPumpSoap} className="icono-menu" />\n')
        output.append('              <h3>Usos Diarios en el Hotel</h3>\n')
        output.append('              <p>Entrega de productos</p>\n')
        output.append('            </div>\n')
    
    # 3. Agregar vista completa antes de Vista de Mensajería
    elif '// Vista de Mensajería' in lines[i]:
        # Insertar vista de amenities
        vista_code = """
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

"""
        output.append(vista_code)
        output.append(lines[i])  # La línea original
    
    i += 1

# Guardar
with open('src/App.jsx', 'w', encoding='utf-8', newline='\r\n') as f:
    f.writelines(output)

print("✅ Todos los componentes UI agregados correctamente!")
print("✅ Botón en menú agregado")
print("✅ Tarjeta en dashboard agregada")
print("✅ Vista completa de amenities agregada")
print("\nRecarga el navegador con Ctrl+Shift+R para ver los cambios")
