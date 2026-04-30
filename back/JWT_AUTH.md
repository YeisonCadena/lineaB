# 🔒 Autenticación JWT - Guía de Uso

## Descripción
El API ahora está protegido con **JSON Web Tokens (JWT)**. Los endpoints de subida de capas requieren autenticación.

## Usuarios de Prueba

```json
{
  "usuarios": [
    { "usuario": "admin", "password": "admin123", "rol": "admin" },
    { "usuario": "editor", "password": "editor123", "rol": "editor" },
    { "usuario": "viewer", "password": "viewer123", "rol": "viewer" }
  ]
}
```

## 1️⃣ Obtener Token (Login)

```bash
POST http://localhost:3000/api/auth/login

Content-Type: application/json

{
  "usuario": "admin",
  "contraseña": "admin123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "usuario": "admin",
    "rol": "admin",
    "nombre": "Administrador"
  },
  "expiresIn": "24h"
}
```

**Respuesta con error (401):**
```json
{
  "success": false,
  "error": "Credenciales inválidas"
}
```

---

## 2️⃣ Usar Token en Endpoints Protegidos

### Subir Capa (Protegido)
```bash
POST http://localhost:3000/api/capas

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

Form Data:
  - archivo: (binary) tu-capa.geojson
  - nombre: Mi Capa GeoJSON
  - descripcion: Descripción de la capa
```

### Validar Capa (Protegido)
```bash
POST http://localhost:3000/api/capas/validar

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

Form Data:
  - archivo: (binary) tu-capa.geojson
```

---

## 3️⃣ Verificar Token

```bash
POST http://localhost:3000/api/auth/verify

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Token válido",
  "usuario": {
    "usuario": "admin",
    "rol": "admin",
    "nombre": "Administrador"
  }
}
```

---

## 4️⃣ Ver Usuarios Demo

```bash
GET http://localhost:3000/api/auth/usuarios-demo
```

---

## Endpoints Públicos (Sin autenticación)

```
GET  /api/departamentos
GET  /api/departamentos/:id
GET  /api/departamentos/:id/geojson
GET  /api/municipios
GET  /api/municipios/:id
GET  /api/municipios/:id/geojson
GET  /api/municipios/departamento/:depto
GET  /api/municipios/cercanos?lat=X&lon=Y&radio=Z
GET  /api/vias
GET  /api/vias/:id
GET  /api/vias/:id/geojson
GET  /api/sitios-turisticos
GET  /api/sitios-turisticos/:id
GET  /api/sitios-turisticos/:id/geojson
GET  /api/sitios-turisticos/categoria/:cat
GET  /api/sitios-turisticos/ciudad/:ciudad
```

## Endpoints Protegidos (Requieren JWT)

```
POST /api/capas                    (requiere token)
POST /api/capas/validar             (requiere token)
POST /api/auth/login                (público - obtener token)
POST /api/auth/verify               (requiere token para verificar)
GET  /api/auth/usuarios-demo        (público - solo DESARROLLO)
```

---

## Ejemplo en PowerShell

```powershell
# 1. Obtener token
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"usuario":"admin","contraseña":"admin123"}' `
  -UseBasicParsing

$token = ($response.Content | ConvertFrom-Json).token

# 2. Usar token en request protegido
$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/verify" `
  -Headers $headers `
  -UseBasicParsing | ConvertTo-Json
```

---

## Configuración en Producción

En `back/.env`, reemplazar:
```env
JWT_SECRET=tu-clave-secreta-super-segura-cambiar-en-produccion
```

Con una clave segura:
```env
JWT_SECRET=sk-proj-2f8a1c9d3e7b5a4f6g9h1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z
```

---

## Tabla de Roles

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| admin | Administrador completo | Todos los endpoints |
| editor | Editor de capas | Subir/validar capas |
| viewer | Solo lectura | GET endpoints |

---

## Errores Comunes

### 401 Unauthorized
```json
{ "error": "Token no proporcionado" }
```
**Solución:** Incluir `Authorization: Bearer <token>` en headers

### 403 Forbidden
```json
{ "error": "Token inválido o expirado" }
```
**Solución:** Obtener nuevo token con POST /api/auth/login

---
