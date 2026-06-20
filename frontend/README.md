# Frontend - Hotel Sabana Brava 314 PMS

## Propósito

Interfaz de usuario para la gestión operativa del hotel. Permite a recepcionistas, administradores y propietarios realizar reservas, check-in/out, gestión de habitaciones, empresas, contratos y facturación.

---

## Stack Tecnológico

| Tecnología    | Propósito                 |
|---------------|---------------------------|
| Next.js 14    | Framework React moderno   |
| React         | Biblioteca de UI          |
| Tailwind CSS  | Estilos utilitarios       |
| ESLint        | Linting de código         |

---

## Vistas Principales

| Rol               | Descripción                           |
|-------------------|---------------------------------------|
| `auth/`           | Login y autenticación                 |
| `receptionist/`   | Reservas, check-in, disponibilidad    |
| `admin/`          | Gestión de usuarios, rooms, companies |
| `owner/`          | Contratos, facturación, usuarios      |

---

## Ejecución Local

```bash
# 1. Instalar dependencias
cd frontend
npm install

# 2. Ejecutar servidor
npm run dev
```

Acceso: `http://localhost:3000`

---

## Estructura Principal

```None
frontend/src/
├── app/           # Páginas Next.js (App Router)
├── auth/          # Componentes y hooks de autenticación
├── admin/         # Vistas y servicios de administrador
├── owner/         # Vistas y servicios de propietario
├── receptionist/  # Vistas y servicios de recepcionista
└── shared/        # Componentes, hooks y utilitarios compartidos
```

---

## Estado

 Implementado con vistas para receptionist, admin y owner.
