# File path: backend/app/contracts/contract_pdf_generator/__init__.py

# Start file:

"""
PDF Generation Module for Contracts

Centralizes all rendering and generation logic for PDF documents
specific to contracts for the Sabana Brava 314 Hotel.

Structure:
- contract_pdf_styles.py: Reusable styles, colors, and dimensions
- contract_pdf.py: Specialized PDF generator for contracts
"""

from .contract_pdf import generate_contract_pdf, generate_contract_preview_pdf

__all__ = [
    "generate_contract_pdf",
    "generate_contract_preview_pdf",
]

# End file:
