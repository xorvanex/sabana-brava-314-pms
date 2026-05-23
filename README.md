# Hotel Sabana Brava 314 PMS

Hotel management system focused on reservation administration, room management, business contracts, and billing operations for Hotel Sabana Brava 314.

---

## Project Overview

This project was developed to centralize and automate the hotel's operational and administrative processes through a scalable backend architecture.

The system is primarily designed for hospitality management related to oil-sector companies and their employees.

---

## Current Project Status

```txt
Backend Development In Progress
```

---

## System Features

### Current Features

* JWT authentication
* Role-based authorization
* User management
* Receptionist registration
* User status management
* Password encryption with bcrypt
* PostgreSQL integration
* FastAPI REST API

---

### Planned Features

* Reservation management
* Room availability control
* Room assignment
* Company management
* Contract administration
* Electronic invoicing
* Billing reports
* Dashboard and analytics

---

## Technology Stack

### Backend

| Technology       | Purpose                   |
| ---------------- | ------------------------- |
| Python           | Main programming language |
| FastAPI          | REST API framework        |
| PostgreSQL       | Relational database       |
| SQLAlchemy       | ORM                       |
| JWT              | Authentication            |
| Passlib + Bcrypt | Password hashing          |
| Pydantic         | Data validation           |
| Uvicorn          | ASGI server               |
| Alembic          | Database migrations       |

---

### Frontend

```txt
Pending implementation
```

---

## Backend Architecture

The backend follows a layered architecture pattern focused on maintainability and scalability.

## Layers

### API Layer

Handles:

* HTTP requests
* Endpoint definitions
* Dependency injection
* Request validation

### Service Layer

Handles:

* Business logic
* Domain validation
* Authentication flow
* System rules

### Repository Layer

Handles:

* Database queries
* Entity persistence
* ORM operations

### Database Layer

Handles:

* Database connection
* SQLAlchemy session lifecycle
* ORM model base

---

## Project Structure

```txt
sabana-brava-314-pms/
│
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── dependencies.py
│   │   │   ├── hashing.py
│   │   │   └── jwt_handler.py
│   │   │
│   │   ├── database/
│   │   │   ├── base.py
│   │   │   ├── connection.py
│   │   │   └── sessions.py
│   │   │
│   │   ├── users/
│   │   │   ├── user_model.py
│   │   │   ├── user_repository.py
│   │   │   ├── user_router.py
│   │   │   ├── user_scheme.py
│   │   │   └── user_service.py
│   │   │
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
├── docker/
├── docs/
└── README.md
```

---

## Authentication System

The API uses JWT authentication with Bearer tokens.

### Authentication Flow

1. User sends credentials to `/users/login`
2. Backend validates credentials
3. API returns JWT access token
4. Protected endpoints require Bearer token authentication

---

## User Roles

| Role          | Permissions               |
| ------------- | ------------------------- |
| DUEÑA         | Full system access        |
| ADMINISTRADOR | Administrative management |
| RECEPCIONISTA | Operational access        |

---

## API Endpoints

### Authentication

| Method | Endpoint       | Description                              |
| ------ | -------------- | ---------------------------------------- |
| POST   | `/users/login` | Authenticate user and generate JWT token |

---

### User Management

| Method | Endpoint                  | Description                         |
| ------ | ------------------------- | ----------------------------------- |
| POST   | `/users/receptionist`     | Create receptionist user            |
| GET    | `/users/receptionists`    | Retrieve all receptionists          |
| GET    | `/users/me`               | Retrieve authenticated user profile |
| PUT    | `/users/me/password`      | Update authenticated user password  |
| PATCH  | `/users/{user_id}/status` | Enable or disable user              |
| GET    | `/users/`                 | Retrieve all users                  |

---

## Critical Dependencies

### Core Frameworks

| Package         | Purpose                     |
| --------------- | --------------------------- |
| fastapi         | API framework               |
| uvicorn         | ASGI server                 |
| sqlalchemy      | ORM and database operations |
| psycopg2-binary | PostgreSQL driver           |

---

### Authentication & Security

| Package      | Purpose                             |
| ------------ | ----------------------------------- |
| PyJWT        | JWT token generation and validation |
| passlib      | Password hashing                    |
| bcrypt       | Secure password encryption          |
| cryptography | Security utilities                  |

---

### Validation & Configuration

| Package          | Purpose                      |
| ---------------- | ---------------------------- |
| pydantic         | Data validation              |
| email-validator  | Email validation             |
| python-dotenv    | Environment variable loading |
| python-multipart | Form-data handling           |

---

## Environment Variables

Create a file named:

```txt
SB314.env
```

Example configuration:

```env
DATABASE_URL=your_database_connection
JWT_SECRET=your_secret_key
```

---

## Local Development Setup

### 1. Clone repository

```bash
git clone <repository_url>
```

---

### 2. Navigate to backend directory

```bash
cd backend
```

---

### 3. Create virtual environment

```bash
python -m venv venv
```

---

### 4. Activate virtual environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux / macOS

```bash
source venv/bin/activate
```

---

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 6. Run development server

```bash
uvicorn app.main:app --reload
```

---

## API Documentation

FastAPI automatically generates interactive API documentation.

### Swagger UI

```txt
http://127.0.0.1:8000/docs
```

---

### ReDoc

```txt
http://127.0.0.1:8000/redoc
```

---

## Database

### Current Database Engine

```txt
PostgreSQL
```

---

### ORM

```txt
SQLAlchemy 2.0
```

---

## Security Features

* JWT authentication
* Password hashing with bcrypt
* Role-based authorization
* Protected API endpoints
* Environment variable configuration
* Secure database connection (SSL)

---

## Development Goals

* Improve hotel operational efficiency
* Centralize administrative data
* Reduce manual process errors
* Provide scalable backend architecture
* Enable future frontend integration

---

## Contributors

| Name                         |
| ---------------------------- |
| León Alejandro Orrego Bello  |
| Dago David Palmera Navarro   |
| Julián David Camargo Padilla |

---

## License

```txt
MIT License
```
