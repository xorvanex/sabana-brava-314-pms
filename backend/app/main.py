# File path: backend/app/main.py

# Application Entry Point:
# - Initializes FastAPI application
# - Configures middleware
# - Registers API routers
# - Exposes root endpoints

# Start file:

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.users import user_router
from app.company.company_router import router as company_router
from app.contract.contract_router import router as contract_router

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
app.include_router(user_router.router)
app.include_router(company_router)
app.include_router(contract_router)
# Health check endpoint
@app.get("/")
def root():
    return {"Mensaje": "API Hotel funcionando correctamente"}


# End file: