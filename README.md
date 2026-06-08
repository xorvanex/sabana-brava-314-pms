# Hotel Sabana Brava 314 PMS

Hotel Sabana Brava 314 PMS is a hotel management system for corporate lodging operations, with a focus on reservations, rooms, company contracts, guests, and billing workflows for Hotel Sabana Brava 314.

The system is designed for hospitality operations involving oil-sector companies and their employees. It centralizes administrative data, reduces manual process errors, and provides a scalable backend for future product growth.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Current Status](#current-status)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Backend Architecture](#backend-architecture)
- [Backend Modules](#backend-modules)
- [Authentication and Roles](#authentication-and-roles)
- [API Endpoints](#api-endpoints)
- [Business Rules and Workflows](#business-rules-and-workflows)
- [PDF Generation](#pdf-generation)
- [Database and Relationships](#database-and-relationships)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [API Documentation](#api-documentation)
- [Frontend Overview](#frontend-overview)
- [Testing and Migrations Status](#testing-and-migrations-status)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)
- [Contributors](#contributors)
- [License](#license)

---

## Project Overview

The application provides backend services for:

- User authentication and role-based access control.
- Company administration.
- Contract administration with assigned rooms.
- Room inventory and operational status management.
- Guest registration and company association.
- Reservation lifecycle management.
- Guest assignment to reservations.
- Room assignment for reservation guests.
- Invoice generation for company billing periods.
- Dynamic contract and invoice PDF generation.

The backend is implemented with FastAPI, SQLAlchemy, PostgreSQL, JWT authentication, and ReportLab PDF generation.

---

## Current Status

| Area | Status | Notes |
| --- | --- | --- |
| Backend API | Implemented | Main backend modules are registered in `backend/app/main.py`. |
| Authentication | Implemented | JWT bearer authentication with role-based dependencies. |
| Companies | Implemented | Company CRUD, NIT lookup, and active/inactive status management. |
| Contracts | Implemented | Contract CRUD, room allocation, date conflict validation, and PDF output. |
| Rooms | Implemented | Room CRUD, status management, active listing, and soft delete. |
| Guests | Implemented | Guest CRUD and company-level guest listing. |
| Reservations | Implemented | Lifecycle transitions, room availability validation, guest assignment, and room assignment. |
| Invoices | Implemented | Company-period invoice generation, invoice lookup, cancellation rules, DIAN simulation, and PDF output. |
| Frontend | Present | A Next.js frontend exists under `frontend/`. |
| Docker | Not configured | `docker/` exists but no Docker source files were found. |
| Documentation folder | Not populated | `docs/` exists but no documentation files were found. |

---

## Core Features

- FastAPI REST API.
- JWT authentication with bearer tokens.
- Role-based authorization.
- Password hashing with Passlib and bcrypt.
- PostgreSQL database integration.
- SQLAlchemy ORM models and relationships.
- Supabase-compatible SSL database connection configuration.
- User management and receptionist registration.
- Company management with unique NIT validation.
- Contract management with room assignment and overlap validation.
- Dynamic contract PDF generation and preview.
- Room status management and soft delete.
- Guest management with unique document validation.
- Reservation creation, updates, status transitions, and availability checks.
- Guest assignment to reservations.
- Guest-to-room assignment inside reservations.
- Invoice generation for billable reservations.
- Dynamic invoice PDF generation and preview.
- DIAN simulation metadata for invoice validation.

---

## Technology Stack

### Backend

| Technology | Purpose |
| --- | --- |
| Python | Main backend language |
| FastAPI | REST API framework |
| Uvicorn | ASGI development server |
| PostgreSQL | Relational database |
| SQLAlchemy | ORM and database access |
| Psycopg2 | PostgreSQL driver |
| Pydantic | Request and response validation |
| PyJWT | JWT token generation and validation |
| Passlib + bcrypt | Password hashing |
| python-dotenv | Environment variable loading |
| python-multipart | Form-data handling |
| email-validator | Email validation support |
| ReportLab | Dynamic PDF generation |
| Alembic | Migration dependency installed; migration scaffold not present |

### Frontend

| Technology | Purpose |
| --- | --- |
| Next.js | Frontend application framework |
| React | UI library |
| Tailwind CSS | Styling utilities |
| ESLint | Frontend linting |

---

## Repository Structure

```txt
sabana-brava-314-pms/
|
├── backend/
|   ├── app/
|   |   ├── auth/
|   |   |   ├── dependencies.py
|   |   |   ├── hashing.py
|   |   |   └── jwt_handler.py
|   |   |
|   |   ├── companies/
|   |   |   ├── company_model.py
|   |   |   ├── company_repository.py
|   |   |   ├── company_router.py
|   |   |   ├── company_scheme.py
|   |   |   └── company_service.py
|   |   |
|   |   ├── contracts/
|   |   |   ├── contract_model.py
|   |   |   ├── contract_repository.py
|   |   |   ├── contract_router.py
|   |   |   ├── contract_scheme.py
|   |   |   ├── contract_service.py
|   |   |   └── contract_pdf_generator/
|   |   |       ├── contract_pdf.py
|   |   |       └── contract_pdf_styles.py
|   |   |
|   |   ├── database/
|   |   |   ├── base.py
|   |   |   ├── connection.py
|   |   |   └── sessions.py
|   |   |
|   |   ├── guests/
|   |   |   ├── guest_model.py
|   |   |   ├── guest_repository.py
|   |   |   ├── guest_router.py
|   |   |   ├── guest_scheme.py
|   |   |   └── guest_service.py
|   |   |
|   |   ├── invoices/
|   |   |   ├── invoice_model.py
|   |   |   ├── invoice_repository.py
|   |   |   ├── invoice_router.py
|   |   |   ├── invoice_scheme.py
|   |   |   ├── invoice_service.py
|   |   |   └── invoice_pdf_generator/
|   |   |       ├── invoice_pdf.py
|   |   |       └── invoice_pdf_styles.py
|   |   |
|   |   ├── reservations/
|   |   |   ├── reservation_model.py
|   |   |   ├── reservation_repository.py
|   |   |   ├── reservation_router.py
|   |   |   ├── reservation_scheme.py
|   |   |   └── reservation_service.py
|   |   |
|   |   ├── rooms/
|   |   |   ├── room_model.py
|   |   |   ├── room_repository.py
|   |   |   ├── room_router.py
|   |   |   ├── room_scheme.py
|   |   |   └── room_service.py
|   |   |
|   |   ├── users/
|   |   |   ├── user_model.py
|   |   |   ├── user_repository.py
|   |   |   ├── user_router.py
|   |   |   ├── user_scheme.py
|   |   |   └── user_service.py
|   |   |
|   |   └── main.py
|   |
|   └── user_pro.py
|
├── frontend/
|   ├── public/
|   ├── src/
|   ├── package.json
|   └── README.md
|
├── docker/
├── docs/
├── requirements.txt
├── SB314.env
├── LICENSE
└── README.md
```

Generated folders such as `.venv/`, `__pycache__/`, `frontend/node_modules/`, and `frontend/.next/` are not part of the source structure.

---

## Backend Architecture

The backend follows a layered architecture:

```txt
Router -> Service -> Repository -> Database
```

| Layer | Responsibility |
| --- | --- |
| Router | Defines HTTP endpoints, form parameters, dependencies, response models, and status codes. |
| Service | Applies business rules, validation, workflow orchestration, and error handling. |
| Repository | Performs database queries, persistence, relationship loading, and transactional operations. |
| Database | Configures SQLAlchemy base, engine, session factory, and request session lifecycle. |

The FastAPI application is initialized in `backend/app/main.py`, where all backend routers are registered.

---

## Backend Modules

| Module | Purpose |
| --- | --- |
| `auth` | JWT handling, password hashing, token verification, and RBAC dependencies. |
| `database` | SQLAlchemy declarative base, PostgreSQL engine configuration, and session dependency. |
| `users` | Login, profile management, receptionist creation, user listing, and user activation status. |
| `companies` | Company registration, lookup, updates, active listing, and active/inactive status toggling. |
| `contracts` | Contract creation, retrieval, updates, status toggling, room assignment, and PDF integration. |
| `contract_pdf_generator` | ReportLab contract PDF builder and styles. |
| `rooms` | Room registration, active listing, updates, operational statuses, and soft delete. |
| `guests` | Guest registration, updates, listing, company filtering, and deletion. |
| `reservations` | Reservation creation, lifecycle transitions, room availability, guest assignment, and room assignment. |
| `invoices` | Invoice generation, retrieval, company filtering, cancellation, DIAN simulation, and PDF integration. |
| `invoice_pdf_generator` | ReportLab invoice PDF builder and styles. |

---

## Authentication and Roles

The API uses JWT bearer authentication.

### Login Flow

1. Send credentials to `POST /users/login`.
2. The backend validates the email and password.
3. The backend rejects inactive users.
4. A JWT access token is returned.
5. Protected endpoints require the token in the `Authorization` header.

```txt
Authorization: Bearer <access_token>
```

### Roles

| Role | Description |
| --- | --- |
| `OWNER` | Full administrative access. |
| `ADMINISTRATOR` | Administrative access to management workflows. |
| `RECEPTIONIST` | Operational access to reservation, room, company, contract, and guest workflows where permitted. |

### Authorization Dependencies

| Dependency | Allowed Roles | Typical Use |
| --- | --- | --- |
| `verify_token` | Any valid bearer token | Current profile and room read operations. |
| `require_admin_or_owner` | `OWNER`, `ADMINISTRATOR` | Privileged administrative and billing actions. |
| `require_admin_owner_or_receptionist` | `OWNER`, `ADMINISTRATOR`, `RECEPTIONIST` | Operational hotel workflows. |

---

## API Endpoints

### Root

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | API health/root message. |

### Users and Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/users/login` | Authenticate user and return a JWT bearer token. |
| POST | `/users/receptionist` | Create a receptionist account. |
| GET | `/users/receptionists` | List receptionist users. |
| GET | `/users/me` | Get authenticated user profile. |
| PUT | `/users/me` | Update authenticated user profile. |
| PUT | `/users/me/password` | Update authenticated user password. |
| PATCH | `/users/{user_id}/status` | Toggle user active/inactive status. |
| GET | `/users/{user_id}` | Get user by ID. |
| GET | `/users/` | List all users. |

### Companies

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/companies/` | Create a company. |
| GET | `/companies/` | List all companies. |
| GET | `/companies/active` | List active companies. |
| GET | `/companies/{company_id}` | Get company by ID. |
| GET | `/companies/search/nit/{nit}` | Get company by NIT. |
| PUT | `/companies/{company_id}` | Update company data. |
| PATCH | `/companies/{company_id}/status` | Toggle company active/inactive status. |

### Contracts

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/contracts/` | Create a contract with optional room assignments. |
| POST | `/contracts/preview/pdf` | Generate a contract PDF preview before persistence. |
| GET | `/contracts/` | List all contracts. |
| GET | `/contracts/active` | List active contracts. |
| GET | `/contracts/company/{company_id}` | List contracts for a company. |
| GET | `/contracts/{contract_id}` | Get contract by ID. |
| PUT | `/contracts/{contract_id}` | Update contract data and room assignments. |
| PATCH | `/contracts/{contract_id}/status` | Toggle contract active/inactive status. |
| GET | `/contracts/{contract_id}/pdf` | Generate a contract PDF for an existing contract. |

### Rooms

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/rooms/` | Create a room. |
| GET | `/rooms/` | List active rooms. |
| GET | `/rooms/{room_id}` | Get room by ID. |
| PUT | `/rooms/{room_id}` | Update room data. |
| PATCH | `/rooms/{room_id}/status` | Update room operational status. |
| DELETE | `/rooms/{room_id}` | Soft delete room by marking it inactive. |

### Guests

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/guests/` | Create a guest linked to a company. |
| GET | `/guests/` | List all guests. |
| GET | `/guests/company/{company_id}` | List guests for a company. |
| GET | `/guests/{guest_id}` | Get guest by ID. |
| PUT | `/guests/{guest_id}` | Update guest data. |
| DELETE | `/guests/{guest_id}` | Delete a guest. |

### Reservations

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/reservations/` | Create a reservation with optional room assignments. |
| GET | `/reservations/` | List all reservations. |
| GET | `/reservations/active` | List active reservations. |
| GET | `/reservations/company/{company_id}` | List reservations for a company. |
| GET | `/reservations/{reservation_id}` | Get reservation by ID. |
| PUT | `/reservations/{reservation_id}` | Update reservation data and assigned rooms. |
| PATCH | `/reservations/{reservation_id}/status` | Toggle reservation between active and cancelled states where allowed. |
| PATCH | `/reservations/{reservation_id}/confirm` | Move reservation to `CONFIRMED`. |
| PATCH | `/reservations/{reservation_id}/check-in` | Move reservation to `CHECKED_IN` and mark rooms occupied. |
| PATCH | `/reservations/{reservation_id}/check-out` | Move reservation to `COMPLETED` and release rooms when possible. |
| PATCH | `/reservations/{reservation_id}/no-show` | Move reservation to `NO_SHOW`. |
| GET | `/reservations/{reservation_id}/guests` | List guests assigned to a reservation. |
| POST | `/reservations/{reservation_id}/guests` | Assign guests to a reservation. |
| DELETE | `/reservations/{reservation_id}/guests/{guest_id}` | Remove a guest from a reservation. |
| GET | `/reservations/{reservation_id}/room-assignments` | List guest-to-room assignments for a reservation. |
| POST | `/reservations/{reservation_id}/room-assignments` | Assign a reservation guest to a reservation room. |
| DELETE | `/reservations/{reservation_id}/room-assignments/{guest_id}` | Remove a guest room assignment. |

### Invoices

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/invoices/generate` | Generate an invoice for a company and billing period. |
| GET | `/invoices` | List all invoices. |
| GET | `/invoices/{invoice_id}` | Get invoice by ID. |
| GET | `/invoices/company/{company_id}` | List invoices for a company. |
| PATCH | `/invoices/{invoice_id}/cancel` | Cancel an invoice only when its status is `PENDING`. |
| POST | `/invoices/preview/pdf` | Generate a PDF preview for an existing invoice. |
| GET | `/invoices/{invoice_id}/pdf` | Generate a downloadable invoice PDF. |

---

## Business Rules and Workflows

### Users

- User emails must be unique.
- Passwords are hashed before persistence.
- Login fails when credentials are invalid.
- Login fails when the user is inactive.
- Receptionist creation is restricted to `OWNER` and `ADMINISTRATOR`.
- Profile updates require at least one field.

### Companies

- Company NIT values must be unique.
- Companies can be activated or deactivated.
- Active company listing is available for operational workflows.
- Inactive companies cannot receive new contracts or guests.

### Contracts

- Contracts belong to exactly one company.
- Contract numbers are generated with the format `CTR-{year}-{sequence}`.
- Contract end date must be greater than start date.
- Contracts cannot be created for inactive companies.
- A company cannot have overlapping active contracts for the same date range.
- Assigned room IDs must be unique.
- Assigned rooms must exist and be active.
- Rooms cannot be assigned to overlapping active contracts.
- Contract PDFs are generated in memory and streamed to the client.

### Rooms

- Room numbers must be unique.
- Only active rooms are returned by the room listing endpoint.
- Deleting a room performs a soft delete by setting `is_active` to `False`.
- Supported room statuses are:
  - `AVAILABLE`
  - `OCCUPIED`
  - `BLOCKED`
  - `MAINTENANCE`
  - `OUT_OF_SERVICE`

### Guests

- Guests belong to exactly one company.
- Guest document numbers must be unique.
- Guests cannot be created for inactive companies.
- Guest deletion removes the guest record from the database.
- Guests assigned to a reservation must belong to the reservation company.

### Reservations

- Reservations belong to one company and one contract.
- Reservation end date must be greater than start date.
- Reservation dates must stay within the contract date range.
- The contract must be active and must belong to the selected company.
- Assigned rooms must exist, be active, and belong to the contract.
- Assigned rooms cannot have overlapping active reservations.
- Duplicate room IDs are rejected.
- Guest assignment cannot exceed room capacity.
- Guest assignment cannot exceed the reservation `guest_count`.
- Guest-to-room assignment is allowed only for reservation guests and reservation rooms.
- Guests cannot be assigned to rooms when the reservation is `CANCELLED`, `COMPLETED`, or `NO_SHOW`.

Reservation statuses:

```txt
PENDING
CONFIRMED
CHECKED_IN
CANCELLED
COMPLETED
NO_SHOW
```

Allowed reservation transitions:

| Current Status | Allowed Next Statuses |
| --- | --- |
| `PENDING` | `CONFIRMED`, `CANCELLED`, `NO_SHOW` |
| `CONFIRMED` | `CHECKED_IN`, `CANCELLED`, `NO_SHOW` |
| `CHECKED_IN` | `COMPLETED` |
| `COMPLETED` | None |
| `CANCELLED` | None |
| `NO_SHOW` | None |

### Invoices

- Invoices are generated for a company and a billing period.
- The company must exist.
- The company must have an active contract.
- Duplicate invoices are rejected for the same company and period.
- Only uninvoiced reservations in billable statuses are included.
- Billable reservation statuses are:
  - `CONFIRMED`
  - `CHECKED_IN`
  - `COMPLETED`
- Reservation dates must fall inside the selected invoice period.
- Reservation cost is calculated from the contract monthly rate, occupied days, and room count.
- VAT is calculated at 19 percent.
- Generated invoices are marked as `ISSUED`.
- DIAN validation is simulated and stores CUFE, tracking ID, XML content, validation status, and response message.
- Cancellation is idempotent for already cancelled invoices.
- Only `PENDING` invoices can be cancelled.

Invoice statuses:

```txt
PENDING
ISSUED
CANCELLED
```

DIAN statuses:

```txt
PENDING
SENT
ACCEPTED
REJECTED
ERROR
```

---

## PDF Generation

The backend uses ReportLab to generate PDF documents dynamically.

### Contract PDFs

- Generated for persisted contracts through `GET /contracts/{contract_id}/pdf`.
- Previewed before persistence through `POST /contracts/preview/pdf`.
- Include company information, contract details, assigned rooms, terms, notes, and signature areas.
- Generated in memory and streamed as PDF responses.

### Invoice PDFs

- Generated for persisted invoices through `GET /invoices/{invoice_id}/pdf`.
- Previewed through `POST /invoices/preview/pdf`.
- Include hotel information, company information, invoice items, financial summary, DIAN metadata, observations, and footer content.
- Generated in memory and streamed as PDF responses.

---

## Database and Relationships

### Database Engine

The backend uses PostgreSQL through SQLAlchemy.

The current database connection configuration:

- Loads environment variables from `SB314.env`.
- Requires `DATABASE_URL`.
- Creates the SQLAlchemy engine with `NullPool`.
- Enforces SSL with `sslmode=require`.

### ORM

The backend uses SQLAlchemy declarative models with:

- UUID primary keys.
- Relationship mappings.
- Joined eager loading in repository queries where needed.
- Timestamps for creation and updates.
- Soft delete where implemented by the domain model.

### Main Relationships

| Relationship | Type | Notes |
| --- | --- | --- |
| Company -> Contracts | One-to-many | A company can have multiple non-overlapping active contracts. |
| Company -> Reservations | One-to-many | Reservations are linked to corporate clients. |
| Company -> Guests | One-to-many | Guests belong to a company. |
| Company -> Invoices | One-to-many | Invoices are generated for company billing periods. |
| Contract -> Rooms | Many-to-many | Implemented through `contract_rooms`. |
| Contract -> Reservations | One-to-many | Reservations must stay within contract dates. |
| Contract -> Invoices | One-to-many | Invoices reference the active contract used for billing. |
| Reservation -> Rooms | Many-to-many | Implemented through `reservation_rooms`. |
| Reservation -> Guests | Many-to-many | Implemented through `reservation_guests`. |
| Reservation -> Room Assignments | One-to-many | Tracks which guest is assigned to which room. |
| Invoice -> Invoice Details | One-to-many | Stores line items for generated invoices. |
| Invoice -> Reservations | One-to-many | Reservations receive `invoice_id` once billed. |

---

## Environment Variables

Create an environment file named `SB314.env`.

Required variables:

```env
DATABASE_URL=postgresql_connection_url
SECRET_KEY_JWT=your_secret_key
```

Notes:

- `SB314.env` is ignored by Git and should not be committed.
- The backend expects `DATABASE_URL` to be available when importing the database connection.
- `SECRET_KEY_JWT` is used for JWT signing and validation.

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone <repository_url>
cd sabana-brava-314-pms
```

### 2. Create a Python virtual environment

```bash
python -m venv .venv
```

### 3. Activate the virtual environment

Windows:

```bash
.venv\Scripts\activate
```

Linux or macOS:

```bash
source .venv/bin/activate
```

### 4. Install backend dependencies

The backend dependency file is located at the repository root.

```bash
pip install -r requirements.txt
```

### 5. Configure environment variables

Create `SB314.env` in the repository root and set the required values.

```env
DATABASE_URL=postgresql_connection_url
SECRET_KEY_JWT=your_secret_key
```

### 6. Run the backend development server

From the repository root:

```bash
uvicorn app.main:app --reload --app-dir backend
```

Alternative from the backend directory:

```bash
cd backend
uvicorn app.main:app --reload
```

### 7. Create an initial owner or administrator

The repository includes an interactive helper script for creating the initial privileged user:

```bash
cd backend
python user_pro.py
```

The script supports creating an `OWNER` or an `ADMINISTRATOR`, hashes the password, prevents duplicate emails, and prevents duplicate users for the selected privileged role.

### 8. Run the frontend development server

```bash
cd frontend
npm install
npm run dev
```

The frontend development server runs at:

```txt
http://localhost:3000
```

---

## API Documentation

FastAPI provides interactive API documentation when the backend server is running.

Swagger UI:

```txt
http://127.0.0.1:8000/docs
```

ReDoc:

```txt
http://127.0.0.1:8000/redoc
```

---

## Frontend Overview

The repository includes a Next.js frontend under `frontend/`.

Observed frontend areas include:

- Authentication.
- Admin views.
- Owner views.
- Receptionist views.
- Company management.
- Room registration and room status views.
- Contract views.
- Reservation and check-in workflows.
- Billing and invoice views.
- Shared layout, API, hooks, and UI components.

The frontend README currently contains the default Next.js template documentation, so the root README documents only the repository-level status.

---

## Testing and Migrations Status

| Area | Current State |
| --- | --- |
| Automated backend tests | No test suite was found in the repository. |
| Automated frontend tests | No frontend test suite was found in the repository. |
| Alembic migrations | Alembic is installed as a dependency, but no migration scaffold was found. |
| Docker configuration | No Dockerfile or Compose configuration was found. |
| CI/CD | No CI/CD workflow files were found. |

---

## Security Notes

- Passwords are hashed before database persistence.
- Protected routes require JWT bearer tokens.
- Role checks are enforced through FastAPI dependencies.
- Inactive users cannot log in.
- Privileged billing actions are restricted to `OWNER` and `ADMINISTRATOR`.
- Database connections enforce SSL with `sslmode=require`.
- Environment files are ignored by Git and should not be committed.
- CORS is currently configured with `allow_origins=["*"]`; production deployments should restrict allowed origins.

---

## Roadmap

Recommended future improvements:

- Add automated backend tests.
- Add automated frontend tests.
- Add Alembic migration scaffolding and versioned migrations.
- Add Docker and Docker Compose configuration.
- Add structured logging.
- Add global exception handling.
- Add pagination and filtering for list endpoints.
- Add refresh token support.
- Add CI/CD workflows.
- Replace DIAN simulation with real electronic invoicing integration when required.
- Expand repository documentation under `docs/`.

---

## Contributors

| Name |
| --- |
| León Alejandro Orrego Bello |
| Dago David Palmera Navarro |
| Julián David Camargo Padilla |

---

## License

MIT License
