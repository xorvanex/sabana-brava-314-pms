# File path: backend/app/main.py

# Start file:

# Application Entry Point:
# - Initializes FastAPI application
# - Configures middleware
# - Registers API routers
# - Exposes root endpoints

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.users.user_router import router as user_router
from app.companies.company_router import router as company_router
from app.contracts.contract_router import router as contract_router
from app.rooms.room_router import router as room_router
from app.reservations.reservation_router import router as reservation_router
from app.guests.guest_router import router as guest_router

# FastAPI application initialization
app = FastAPI(title="Hotel Sabana Brava 314")

# CORS configuration for API access control
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Register user-related routes
app.include_router(user_router)
app.include_router(company_router)
app.include_router(contract_router)
app.include_router(room_router)
app.include_router(reservation_router)
app.include_router(guest_router)

# Health check endpoint
@app.get("/")
def root():
    return {"Mensaje": "API Hotel funcionando correctamente"}

# End file:
