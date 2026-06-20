# Backend - Hotel Sabana Brava 314 PMS

## Propósito

API REST para la gestión operativa del hotel, enfocada en reservas, habitaciones, contratos corporativos, huéspedes y facturación. Diseñado para operaciones hoteleras del sector oil & gas.

---

## Stack Tecnológico

| Tecnología        | Propósito                 |
|-------------------|---------------------------|
| Python 3.11       | Lenguaje principal        |
| FastAPI           | Framework REST API        |
| Uvicorn           | Servidor ASGI             |
| PostgreSQL        | Base de datos relacional  |
| SQLAlchemy        | ORM                       |
| Pydantic          | Validación de datos       |
| PyJWT             | Autenticación con tokens  |
| Passlib + bcrypt  | Hashing de contraseñas    |
| ReportLab         | Generación de PDFs        |

---

## Arquitectura

```None
Router → Service → Repository → Database
```

| Capa          | Responsabilidad                                   |
|---------------|---------------------------------------------------|
| Router        | Define endpoints HTTP, parámetros y respuestas.   |
| Service       | Reglas de negocio, validaciones y orquestación.   |
| Repository    | Consultas y operaciones de base de datos.         |
| Database      | Configuración de SQLAlchemy y sesión.             |

---

## Módulos Principales

| Módulo            | Descripción                               |
|-------------------|-------------------------------------------|
| `auth`            | JWT, hashing y verificación de roles.     |
| `users`           | Gestión de usuarios y recepcionistas.     |
| `companies`       | Administración de empresas clientes.      |
| `contracts`       | Contratos y asignación de habitaciones.   |
| `rooms`           | Inventario y estados operativos.          |
| `guests`          | Registro de huéspedes por empresa.        |
| `reservations`    | Ciclo de vida de reservas.                |
| `invoices`        | Generación de facturas por período.       |

---

## Autenticación y Roles

- **OWNER**: Acceso administrativo completo.
- **ADMINISTRATOR**: Gestión administrativa.
- **RECEPTIONIST**: Operaciones de recepción y reservas.

Autenticación mediante JWT Bearer token.

---

## Variables de Entorno

Crear archivo `SB314.env` en la raíz del proyecto:

```env
DATABASE_URL=postgresql_connection_url
SECRET_KEY_JWT=your_secret_key
```

---

## Ejecución Local

```bash
# 1. Crear entorno virtual
python -m venv .venv

# 2. Activar
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/macOS

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Ejecutar servidor
cd backend
uvicorn app.main:app --reload
```

Acceso: `http://localhost:8000`

Documentación interactiva: `http://localhost:8000/docs`

---

## Scripts Útiles

- `python user_pro.py`: Crear usuario OWNER o ADMINISTRATOR inicial.

---

## Estado

✅ Implementado con todos los módulos principales funcionales.
