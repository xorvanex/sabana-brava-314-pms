"""
PDF Generation Module for Invoices

Centralizes all rendering and generation logic for PDF documents
specific to invoices for the Sabana Brava 314 Hotel.

Structure:
- invoice_pdf_styles.py: Reusable styles, colors, and dimensions
- invoice_pdf.py: Specialized PDF generator for invoices
"""

from .invoice_pdf import generate_invoice_pdf, generate_invoice_preview_pdf

__all__ = [
    "generate_invoice_pdf",
    "generate_invoice_preview_pdf",
]
