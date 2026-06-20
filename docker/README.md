# Docker Setup - Sabana Brava 314 PMS

Orquestación de Backend (FastAPI) y Frontend (Next.js) con Docker Compose.

## Requisitos

- Docker >= 20.10
- Docker Compose >= 2.0
- `SB314.env` en la raíz del proyecto

## Quick Start

### Iniciar ambos servicios

```bash
cd docker
docker-compose up
```

**O en modo detached (sin logs en consola):**

```bash
docker-compose up -d
```

### Parar los servicios

```bash
docker-compose down
```

### Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose logs -f

# Solo frontend
docker-compose logs -f frontend

# Solo backend
docker-compose logs -f backend
```

## URLs de acceso

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **Backend Docs**: `http://localhost:8000/docs`

## 🔧 Servicios

### Backend (FastAPI)

- **Puerto**: 8000
- **Hot-reload**: ✅ Habilitado
- **Volumen**: `../backend:/app/backend`
- **Variables de entorno**: Cargadas desde `SB314.env`

### Frontend (Next.js)

- **Puerto**: 3000
- **Hot-reload**: ✅ Habilitado
- **Volumen**: `../frontend:/app` (+ `/app/node_modules` persistente)
- **Dependencia**: Espera a que backend esté listo

## Notas importantes

1. **Hot-reload**: Los cambios en el código local se reflejan automáticamente en los contenedores
2. **Node modules**: El volumen `/app/node_modules` es persistente para evitar reinstalaciones
3. **Backend env**: Asegúrate de que `SB314.env` exista en la raíz del proyecto
4. **First run**: La primera ejecución tardará más (instala dependencias)

## Comandos útiles

```bash
# Reconstruir imágenes (cuando cambies requirements.txt o package.json)
docker-compose build

# Reconstruir sin caché
docker-compose build --no-cache

# Ver estado de servicios
docker-compose ps

# Ejecutar comandos dentro del contenedor
docker-compose exec frontend npm run lint
docker-compose exec backend bash

# Ver logs de errores en tiempo real
docker-compose logs -f --tail=50
```

## Troubleshooting

### "Address already in use"

```bash
# Cambiar puertos en docker-compose.yml o liberar los puertos:
docker-compose down
```

### "Cannot connect to Docker daemon"

Asegúrate de que Docker Desktop/engine está corriendo.

### Frontend no se conecta a Backend

Verifica que el frontend esté usando la URL correcta del backend. En el contenedor Docker, usa `http://backend:8000` en lugar de `http://localhost:8000`.

### Node modules duplicados/errores

```bash
docker-compose down -v  # Elimina volúmenes
docker-compose build --no-cache
docker-compose up
```
