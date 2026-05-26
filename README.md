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
* Company management
* Contract management
* Contract PDF generation

---

### Planned Features

* Reservation management
* Room availability control
* Room assignment
* Electronic invoicing
* Billing reports
* Dashboard and analytics

---

## Newly Implemented Features

### Company Management

The backend now includes complete company administration features.

Implemented capabilities:

* Company registration
* Unique NIT validation
* Company update operations
* Company activation/deactivation
* Company retrieval by ID
* Company listing
* Business validation rules

---

### Contract Management

The system now supports company contract administration.

Implemented capabilities:

* Contract creation
* Contract update operations
* Contract activation/deactivation
* Contract retrieval by ID
* Contract listing
* Contract PDF generation
* Contract-company relational mapping
* Active contract validation per company
* Contract date validation
* Company status validation before contract creation

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
| ReportLab        | Dynamic PDF generation    |

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

## Development Notes

### Current Architectural Pattern

The backend follows a layered architecture:

```txt
Router → Service → Repository → Database
```

This separation improves:

* Maintainability
* Scalability
* Testability
* Business rule isolation

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
│   │   ├── company/
│   │   │   ├── company_model.py
│   │   │   ├── company_repository.py
│   │   │   ├── company_router.py
│   │   │   ├── company_scheme.py
│   │   │   └── company_service.py
│   │   │
│   │   ├── contract/
│   │   │   ├── contract_model.py
│   │   │   ├── contract_repository.py
│   │   │   ├── contract_router.py
│   │   │   ├── contract_scheme.py
│   │   │   ├── contract_service.py
│   │   │   └── contract_pdf_service.py
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

## Authentication and Authorization

### JWT Authentication

Protected endpoints require:

```txt
Authorization: Bearer <token>
```

### Role-Based Access Control

Administrative endpoints are restricted using dependency-based authorization middleware.

Protected roles:

* DUEÑA
* ADMINISTRADOR

---

## User Roles

| Role          | Permissions               |
| ------------- | ------------------------- |
| DUEÑA         | Full system access        |
| ADMINISTRADOR | Administrative management |
| RECEPCIONISTA | Operational access        |

---

## Current API Modules

| Module       | Status      |
| ------------ | ----------- |
| Auth         | Implemented |
| Users        | Implemented |
| Companies    | Implemented |
| Contracts    | Implemented |
| Rooms        | Pending     |
| Reservations | Pending     |
| Billing      | Pending     |

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

### Company Endpoints

| Method | Endpoint                         | Description            |
| ------ | -------------------------------- | ---------------------- |
| POST   | `/companies/`                    | Create company         |
| GET    | `/companies/`                    | Retrieve all companies |
| GET    | `/companies/{company_id}`        | Retrieve company by ID |
| PUT    | `/companies/{company_id}`        | Update company         |
| PATCH  | `/companies/{company_id}/status` | Toggle company status  |

---

### Contract Endpoints

| Method | Endpoint                          | Description             |
| ------ | --------------------------------- | ----------------------- |
| POST   | `/contracts/`                     | Create contract         |
| GET    | `/contracts/`                     | Retrieve all contracts  |
| GET    | `/contracts/{contract_id}`        | Retrieve contract by ID |
| PUT    | `/contracts/{contract_id}`        | Update contract         |
| PATCH  | `/contracts/{contract_id}/status` | Toggle contract status  |
| GET    | `/contracts/{contract_id}/pdf`    | Generate contract PDF   |

---

## Contract PDF Generation

The backend dynamically generates PDF contract documents using ReportLab.

### Features

* In-memory PDF generation
* Streaming PDF responses
* Dynamic business information rendering
* Contract term rendering
* No physical file persistence on server

### Endpoint

| Method | Endpoint              | Description                |
| ------ | --------------------- | -------------------------- |
| GET    | `/contracts/{id}/pdf` | Generate contract PDF file |

---

## Database Relationships

### Company ↔ Contract

Relationship type:

```txt
One-to-Many
```

Business rules:

* One company can have multiple contracts
* One contract belongs to one company
* Only one active contract per company is allowed

---

## ORM Design

The backend uses SQLAlchemy ORM with:

* Declarative model mapping
* UUID primary keys
* Bidirectional relationships
* Joined eager loading
* Automatic timestamp updates

---

## Validation Rules

### Company Validations

* Unique NIT enforcement
* Email format validation
* Required legal name validation

### Contract Validations

* End date must be greater than start date
* Base tariff must be greater than zero
* Terms field minimum length validation
* Inactive companies cannot receive contracts
* Only one active contract per company

### User Validations

* Unique email validation
* Password hashing before persistence
* Role-restricted receptionist creation
* Active account validation during login

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

### PDF Engine

| Library   | Purpose                |
| --------- | ---------------------- |
| ReportLab | Dynamic PDF generation |

---

## Environment Variables

Create a file named:

```txt
SB314.env
```

Required environment variables:

```env
DATABASE_URL=postgresql_connection_url
SECRET_KEY_JWT=your_secret_key
```

---

## Database

### Current Database Engine

```txt
PostgreSQL
```

---

### Database Engine Configuration

#### PostgreSQL + Supabase

The system uses PostgreSQL hosted on Supabase with SSL-secured connections.

Current configuration includes:

* SQLAlchemy ORM
* SSL connection enforcement
* NullPool connection strategy
* Environment-based configuration

---

### ORM

```txt
SQLAlchemy 2.0
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

## Security Features

* JWT authentication
* Password hashing with bcrypt
* Role-based authorization
* Protected API endpoints
* Active account validation
* Protected administrative routes
* Environment variable protection
* Environment variable configuration
* SSL-secured database connections
* Secure database connection (SSL)

---

## Development Goals

* Improve hotel operational efficiency
* Centralize administrative data
* Reduce manual process errors
* Provide scalable backend architecture
* Enable future frontend integration

---

## Pending Technical Improvements

Planned future improvements:

* Alembic migration integration
* Docker containerization
* Refresh token implementation
* Pagination support
* Global exception handlers
* Structured logging
* Automated testing
* CI/CD pipeline

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
