# Hotel Sabana Brava 314 PMS

## Propósito del Sistema

Sistema de gestión hotelera (PMS) para operaciones corporativas del sector oil & gas. Centraliza la administración de reservas, habitaciones, contratos empresariales, huéspedes y facturación, reduciendo errores en procesos manuales y proporcionando una base escalable para el crecimiento del producto.

---

## Autores

| Rol               | Nombre                            |
|-------------------|-----------------------------------|
| Líder de Equipo   | **Dago David Palmera Navarro**    |
| Desarrollador     | Julián David Camargo Padilla      |
| Desarrollador     | León Alejandro Orrego Bello       |

---

## Tech Stack

| Componente    | Tecnología                                |
|---------------|-------------------------------------------|
| Backend       | Python, FastAPI, PostgreSQL, SQLAlchemy   |
| Frontend      | Next.js, React, Tailwind CSS              |
| Docker        | Docker, Docker Compose                    |

---

## Estructura

```None
sabana-brava-314-pms/
├── backend/      # API REST - FastAPI
├── frontend/    # Interfaz - Next.js
├── docker/      # Orquestación Docker
├── docs/        # Documentación
└── README.md    # Este archivo
```

---

## Inicio Rápido

### Con Docker

```bash
cd docker
docker-compose up
```

### Manual

**Backend:**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## Recursos

| Servicio  | URL                           |
|-----------|-------------------------------|
| Frontend  | `http://localhost:3000`       |
| API Docs  | `http://localhost:8000/docs`  |
| API       | `http://localhost:8000`       |

---

## Licencia

MIT License
