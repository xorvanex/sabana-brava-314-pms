# File path: backend/app/main.py

"""
Application entry point for Hotel Sabana Brava 314 API.

Initializes FastAPI application, configures middleware, registers API routers,
and exposes root endpoints.
"""

# Third-party imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Local application imports
from app.users.user_router import router as user_router
from app.companies.company_router import router as company_router
from app.contracts.contract_router import router as contract_router
from app.rooms.room_router import router as room_router
from app.reservations.reservation_router import router as reservation_router
from app.guests.guest_router import router as guest_router
from app.invoices.invoice_router import router as invoice_router

# ============================================================================
# Application Configuration
# ============================================================================

app = FastAPI(title="Hotel Sabana Brava 314")

# ============================================================================
# Middleware Registration
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ============================================================================
# Router Registration
# ============================================================================

app.include_router(user_router)
app.include_router(company_router)
app.include_router(contract_router)
app.include_router(room_router)
app.include_router(reservation_router)
app.include_router(guest_router)
app.include_router(invoice_router)

# ============================================================================
# Application Instance
# ============================================================================

@app.get("/")
def root():
    return {"Mensaje": "API Hotel funcionando correctamente"}
