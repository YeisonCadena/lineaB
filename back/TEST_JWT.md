# Test de Endpoints con JWT

## 1. Ver usuarios disponibles
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/usuarios-demo" -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

## 2. Obtener Token (Admin)
```powershell
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"usuario":"admin","contraseña":"admin123"}' `
  -UseBasicParsing

$login = $loginResponse.Content | ConvertFrom-Json
$token = $login.token

Write-Host "Token obtenido: $token"
Write-Host "Usuario: $($login.usuario.usuario)"
Write-Host "Rol: $($login.usuario.rol)"
```

## 3. Verificar Token
```powershell
$headers = @{
  "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/verify" `
  -Method POST `
  -Headers $headers `
  -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

## 4. Acceder a Endpoint Público (sin token)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/departamentos" -UseBasicParsing | ConvertFrom-Json | Select-Object success, total
```

## 5. Intenta subir archivo sin token (ERROR 401)
```powershell
$formData = @{
  archivo = Get-Item -LiteralPath "C:\ruta\archivo.geojson"
  nombre = "Mi Capa"
  descripcion = "Descripción"
}

Invoke-WebRequest -Uri "http://localhost:3000/api/capas" `
  -Method POST `
  -Form $formData `
  -UseBasicParsing
# Debería retornar: 401 Token no proporcionado
```

## 6. Subir archivo CON token (EXITOSO)
```powershell
$formData = @{
  archivo = Get-Item -LiteralPath "C:\ruta\archivo.geojson"
  nombre = "Mi Capa Segura"
  descripcion = "Descripción segura"
}

$headers = @{
  "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:3000/api/capas" `
  -Method POST `
  -Form $formData `
  -Headers $headers `
  -UseBasicParsing | ConvertFrom-Json
```

## 7. Cambiar a usuario con rol "viewer"
```powershell
$viewerResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"usuario":"viewer","contraseña":"viewer123"}' `
  -UseBasicParsing

$viewer = $viewerResponse.Content | ConvertFrom-Json
$viewerToken = $viewer.token

Write-Host "Token viewer: $viewerToken"
Write-Host "Rol: viewer (solo lectura)"

# Intenta subir con token de viewer (debería funcionar pero registra que fue viewer)
```
