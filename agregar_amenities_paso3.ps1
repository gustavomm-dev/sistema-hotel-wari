# Script final para agregar botón en menú, tarjeta en dashboard y vista de amenities
$filePath = "src\App.jsx"
$content = Get-Content $filePath -Raw

# 1. Agregar botón en el menú de navegación (después del botón de Inventario)
$botonMenu = @"
          <button
            className={``navbar-enlace "+"`${vistaActual === 'amenities' ? 'activo' : ''}``}
            onClick={() => setVistaActual('amenities')}
          >
            <FontAwesomeIcon icon={faPumpSoap} />
            <span>Usos Diarios en el Hotel</span>
          </button>
"@

$content = $content -replace "(<span>Inventario</span>\s+</button>)", "`$1`r`n$botonMenu"

# 2. Agregar tarjeta en el dashboard (después de la tarjeta de Inventario)
$tarjetaDashboard = @"
            <div className="tarjeta-menu" onClick={() => setVistaActual('amenities')}>
              <FontAwesomeIcon icon={faPumpSoap} className="icono-menu" />
              <h3>Usos Diarios en el Hotel</h3>
              <p>Entrega de productos</p>
            </div>
"@

$content = $content -replace "(<p>Control de stock</p>\s+</div>)", "`$1`r`n$tarjetaDashboard"

# Guardar
$content | Set-Content $filePath -NoNewline

Write-Host "Pasos 4 y 5 completados: Botón de menú y tarjeta de dashboard agregados"
