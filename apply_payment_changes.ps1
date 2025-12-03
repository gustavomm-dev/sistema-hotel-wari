$filePath = "c:\Users\gusta\OneDrive\Desktop\sistema_hotel wari 2003\src\App.jsx"
$content = Get-Content $filePath -Raw

# 1. Cambiar el estado inicial de metodoPagoRegistro
$content = $content -replace "const \[metodoPagoRegistro, setMetodoPagoRegistro\] = useState\('Efectivo'\)", "const [metodoPagoRegistro, setMetodoPagoRegistro] = useState('Paga al finalizar estadía')"

# 2. Cambiar los reset de metodoPagoRegistro
$content = $content -replace "setMetodoPagoRegistro\('Efectivo'\)", "setMetodoPagoRegistro('Paga al finalizar estadía')"

# 3. Cambiar el estado inicial de metodoPagoSeleccionado  
$content = $content -replace "const \[metodoPagoSeleccionado, setMetodoPagoSeleccionado\] = useState\('Efectivo'\)", "const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('Paga al finalizar estadía')"

# 4. Cambiar los reset de metodoPagoSeleccionado
$content = $content -replace "setMetodoPagoSeleccionado\('Efectivo'\)", "setMetodoPagoSeleccionado('Paga al finalizar estadía')"

# 5. Actualizar la lógica condicional
$content = $content -replace "const yaPago = habitacion && habitacion\.metodoPago && habitacion\.metodoPago !== 'Efectivo'", "const yaPago = habitacion && habitacion.metodoPago && habitacion.metodoPago !== 'Efectivo' && habitacion.metodoPago !== 'Paga al finalizar estadía'"

# 6. Agregar opción en el selector del formulario de registro
$pattern = '(<select\s+value=\{metodoPagoRegistro\}\s+onChange=\{\(e\) => setMetodoPagoRegistro\(e\.target\.value\)\}\s+>\s+<option value="Efectivo">Efectivo</option>)'
$replacement = '<select 
                value={metodoPagoRegistro}
                onChange={(e) => setMetodoPagoRegistro(e.target.value)}
              >
                <option value="Paga al finalizar estadía">Paga al finalizar estadía</option>
                <option value="Efectivo">Efectivo</option>'
$content = $content -replace $pattern, $replacement

# 7. Agregar opción en el selector del modal
$pattern2 = '(<select\s+id="metodo-pago"\s+className="selector-metodo-pago"\s+value=\{metodoPagoSeleccionado\}\s+onChange=\{\(e\) => setMetodoPagoSeleccionado\(e\.target\.value\)\}\s+>\s+<option value="Efectivo">Efectivo</option>)'
$replacement2 = '<select 
                          id="metodo-pago"
                          className="selector-metodo-pago" 
                          value={metodoPagoSeleccionado}
                          onChange={(e) => setMetodoPagoSeleccionado(e.target.value)}
                        >
                          <option value="Paga al finalizar estadía">Paga al finalizar estadía</option>
                          <option value="Efectivo">Efectivo</option>'
$content = $content -replace $pattern2, $replacement2

Set-Content $filePath -Value $content
Write-Host "Cambios aplicados correctamente"
