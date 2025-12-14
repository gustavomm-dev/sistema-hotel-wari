# Script de Despliegue Automático - Hotel Wari
# Ejecuta este archivo para desplegar tu aplicación

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE HOTEL WARI - NETLIFY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar que existe la carpeta dist
if (!(Test-Path "dist")) {
    Write-Host "❌ Error: No existe la carpeta 'dist'" -ForegroundColor Red
    Write-Host "Ejecutando 'npm run build'..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al construir la aplicación" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Carpeta 'dist' encontrada" -ForegroundColor Green
Write-Host ""

# Paso 2: Verificar login en Netlify
Write-Host "Verificando sesión de Netlify..." -ForegroundColor Yellow
netlify status 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No has iniciado sesión en Netlify" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "INSTRUCCIONES:" -ForegroundColor Cyan
    Write-Host "1. Se abrirá tu navegador" -ForegroundColor White
    Write-Host "2. Inicia sesión con tu cuenta de Netlify" -ForegroundColor White
    Write-Host "3. Autoriza la aplicación" -ForegroundColor White
    Write-Host "4. Vuelve a esta ventana" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona ENTER para continuar"
    
    netlify login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al iniciar sesión" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Sesión de Netlify activa" -ForegroundColor Green
Write-Host ""

# Paso 3: Vincular con el sitio existente
Write-Host "Vinculando con el sitio existente..." -ForegroundColor Yellow
netlify link --name gustavo-hotel-wari-system

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No se pudo vincular automáticamente" -ForegroundColor Yellow
    Write-Host "Intentando vincular manualmente..." -ForegroundColor Yellow
    netlify link
}

Write-Host ""

# Paso 4: Desplegar
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLEGANDO APLICACIÓN..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

netlify deploy --prod --dir=dist

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ DESPLIEGUE EXITOSO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tu sitio está en:" -ForegroundColor Cyan
    Write-Host "https://gustavo-hotel-wari-system.netlify.app" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Limpia el caché del navegador" -ForegroundColor Yellow
    Write-Host "Presiona Ctrl + Shift + R en el navegador" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Error al desplegar" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUCIÓN ALTERNATIVA:" -ForegroundColor Cyan
    Write-Host "1. Ve a https://app.netlify.com" -ForegroundColor White
    Write-Host "2. Busca 'gustavo-hotel-wari-system'" -ForegroundColor White
    Write-Host "3. Ve a 'Deploys'" -ForegroundColor White
    Write-Host "4. Arrastra la carpeta 'dist' completa" -ForegroundColor White
    Write-Host ""
}

Read-Host "Presiona ENTER para cerrar"
