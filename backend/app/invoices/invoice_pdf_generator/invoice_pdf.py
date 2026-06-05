"""
Specialized module for generating PDFs for invoices.
It handles all the logic for rendering invoices in PDF format.
"""

from datetime import datetime
from decimal import Decimal
from io import BytesIO
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib.units import inch

from .invoice_pdf_styles import (
    InvoicePDFStyles,
    InvoicePDFColors,
    InvoicePDFTableStyles,
    InvoicePDFDimensions,
)


# Hotel fixed information
HOTEL_NAME = "Hotel Sabana Brava 314"
HOTEL_NIT = "XXXXX"
HOTEL_ADDRESS = "XXXXX"
HOTEL_PHONE = "XXXXX"
HOTEL_EMAIL = "XXXXX"


class InvoicePDFGenerator:
    """
    Class responsible for generating PDFs for invoices.
    It encapsulates all the rendering logic and document structure.
    """

    def __init__(self, invoice, company):
        """
        Initialize the generator with invoice and company data.
        
        Args:
            invoice: Instance of the database invoice
            company: Instance of the company associated with the invoice
        """
        self.invoice = invoice
        self.company = company
        self.styles = InvoicePDFStyles()
        self.colors = InvoicePDFColors()
        self.table_styles = InvoicePDFTableStyles()
        self.dimensions = InvoicePDFDimensions()

    def generate(
        self,
        content_disposition: str = "attachment",
        filename: str = ""
    ) -> StreamingResponse:
        """
        Generates the PDF of the invoice and returns a streaming response.
        
        Returns:
            StreamingResponse: PDF ready for download
        """
        # Create buffer in memory for the PDF
        pdf_buffer = BytesIO()

        # Configure PDF document with professional margins
        pdf = SimpleDocTemplate(
            pdf_buffer,
            pagesize=(8.5*inch, 11*inch),
            rightMargin=self.dimensions.MARGIN*inch,
            leftMargin=self.dimensions.MARGIN*inch,
            topMargin=self.dimensions.MARGIN*inch,
            bottomMargin=self.dimensions.MARGIN*inch,
            title=f"Factura_{self.invoice.invoice_number}"
        )

        # Build PDF content
        content = []
        content.extend(self._build_header())
        content.extend(self._build_hotel_information())
        content.extend(self._build_company_information())
        content.extend(self._build_invoice_items_table())
        content.extend(self._build_financial_summary())
        content.extend(self._build_electronic_information())
        content.extend(self._build_observations())
        content.extend(self._build_footer())

        # Generate PDF in memory
        pdf.build(content)
        pdf_buffer.seek(0)

        pdf_filename = filename if filename else f"invoice_{self.invoice.invoice_number}.pdf"

        # Return streaming response
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition":
                f"{content_disposition}; filename={pdf_filename}"
            }
        )

    def _format_currency(self, amount: Decimal) -> str:
        """
        Format amount as currency string.
        
        Args:
            amount: Amount to format
            
        Returns:
            Formatted currency string
        """
        return f"${amount:,.2f} COP"

    def _format_date(self, date_obj: datetime) -> str:
        """
        Format date as string.
        
        Args:
            date_obj: Date to format
            
        Returns:
            Formatted date string
        """
        return date_obj.strftime('%d/%m/%Y')

    def _get_period_display(self) -> str:
        """
        Get formatted period string.
        
        Returns:
            Period formatted as "Month Year"
        """
        month_names = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ]
        start_month = month_names[self.invoice.period_start.month - 1]
        return f"{start_month} {self.invoice.period_start.year}"

    def _get_status_display(self) -> str:
        """
        Get status display string.
        
        Returns:
            Status string in Spanish
        """
        status_map = {
            "PENDING": "Pendiente",
            "ISSUED": "Emitida",
            "CANCELLED": "Cancelada"
        }
        status = self.invoice.invoice_status or ""
        return status_map.get(status, status) or "No especificado"

    def _build_header(self) -> list:
        """
        Create the invoice header section.
        Include the hotel name, document type, and general information.
        
        Returns:
            list: List of items to add to the PDF
        """
        content = []

        # Hotel name
        content.append(
            Paragraph(
                "<b>HOTEL SABANA BRAVA 314</b>",
                self.styles.get_invoice_title_style()
            )
        )

        # Document type
        content.append(
            Paragraph(
                "FACTURA ELECTRÓNICA",
                self.styles.get_invoice_subtitle_style()
            )
        )
        content.append(Spacer(1, self.dimensions.SPACE_SMALL*inch))

        # Invoice information table
        header_data = [[
            Paragraph(
                f"<b>Factura No.</b><br/>{self.invoice.invoice_number}",
                self.styles.get_label_style()
            ),
            Paragraph(
                f"<b>Fecha de emisión</b><br/>{self._format_date(self.invoice.created_at)}",
                self.styles.get_label_style()
            ),
            Paragraph(
                f"<b>Periodo facturado</b><br/>{self._get_period_display()}",
                self.styles.get_label_style()
            ),
            Paragraph(
                f"<b>Estado</b><br/>{self._get_status_display()}",
                self.styles.get_label_style()
            )
        ]]

        header_table = Table(header_data, colWidths=[1.75*inch, 1.75*inch, 1.75*inch, 1.75*inch])
        header_table.setStyle(TableStyle(self.table_styles.get_header_table_style()))
        content.append(header_table)
        content.append(Spacer(1, self.dimensions.SPACE_MEDIUM*inch))

        return content

    def _build_hotel_information(self) -> list:
        """
        Build the section with hotel information.
        
        Returns:
            list: List of items to add to the PDF
        """
        content = []

        # Title section
        content.append(
            Paragraph("<b>DATOS DEL HOTEL</b>", self.styles.get_heading_style())
        )

        # Hotel data in table
        hotel_data = [
            [
                Paragraph("<b>Nombre:</b>", self.styles.get_label_style()),
                Paragraph(HOTEL_NAME, self.styles.get_normal_style())
            ],
            [
                Paragraph("<b>NIT:</b>", self.styles.get_label_style()),
                Paragraph(HOTEL_NIT, self.styles.get_normal_style())
            ],
            [
                Paragraph("<b>Dirección:</b>", self.styles.get_label_style()),
                Paragraph(HOTEL_ADDRESS, self.styles.get_normal_style())
            ],
            [
                Paragraph("<b>Teléfono:</b>", self.styles.get_label_style()),
                Paragraph(HOTEL_PHONE, self.styles.get_normal_style())
            ],
            [
                Paragraph("<b>Email:</b>", self.styles.get_label_style()),
                Paragraph(HOTEL_EMAIL, self.styles.get_normal_style())
            ],
        ]

        hotel_table = Table(hotel_data, colWidths=[1.6*inch, 5.4*inch])
        hotel_table.setStyle(TableStyle(self.table_styles.get_data_table_style()))
        content.append(hotel_table)
        content.append(Spacer(1, self.dimensions.SPACE_MEDIUM*inch))

        return content

    def _build_company_information(self) -> list:
        """
        Build the section with information from the client company.
        
        Returns:
            list: List of items to add to the PDF
        """
        content = []

        # Title section
        content.append(
            Paragraph("<b>DATOS DE LA EMPRESA</b>", self.styles.get_heading_style())
        )

        # Company data in table
        company_data = [
            [
                Paragraph("<b>Empresa:</b>", self.styles.get_label_style()),
                Paragraph(
                    self.company.name if self.company.name else "No especificado",
                    self.styles.get_normal_style()
                )
            ],
            [
                Paragraph("<b>NIT:</b>", self.styles.get_label_style()),
                Paragraph(
                    self.company.nit if self.company.nit else "No especificado",
                    self.styles.get_normal_style()
                )
            ],
            [
                Paragraph("<b>Dirección:</b>", self.styles.get_label_style()),
                Paragraph(
                    self.company.address if self.company.address else "No especificada",
                    self.styles.get_normal_style()
                )
            ],
            [
                Paragraph("<b>Email:</b>", self.styles.get_label_style()),
                Paragraph(
                    self.company.email if self.company.email else "No especificado",
                    self.styles.get_normal_style()
                )
            ],
            [
                Paragraph("<b>Contacto:</b>", self.styles.get_label_style()),
                Paragraph(
                    self.company.phone if self.company.phone else "No especificado",
                    self.styles.get_normal_style()
                )
            ],
        ]

        company_table = Table(company_data, colWidths=[1.6*inch, 5.4*inch])
        company_table.setStyle(TableStyle(self.table_styles.get_data_table_style()))
        content.append(company_table)
        content.append(Spacer(1, self.dimensions.SPACE_MEDIUM*inch))

        return content

    def _build_invoice_items_table(self) -> list:
        """
        Build the section with invoice line items.
        
        Returns:
            list: List of items to add to the PDF
        """
        content = []

        # Title section
        content.append(
            Paragraph("<b>DETALLE DE FACTURACIÓN</b>", self.styles.get_heading_style())
        )

        # Table header
        items_data = [[
            Paragraph("<b>Descripción</b>", self.styles.get_label_style()),
            Paragraph("<b>Cantidad</b>", self.styles.get_label_style()),
            Paragraph("<b>Valor Unitario</b>", self.styles.get_label_style()),
            Paragraph("<b>Total</b>", self.styles.get_label_style()),
        ]]

        # Add invoice details
        for detail in self.invoice.details:
            description = detail.description or "Sin descripción"
            items_data.append([
                Paragraph(description, self.styles.get_normal_style()),
                Paragraph(detail.description, self.styles.get_normal_style()),
                Paragraph(str(detail.quantity), self.styles.get_normal_style()),
                Paragraph(self._format_currency(detail.unit_price), self.styles.get_normal_style()),
                Paragraph(self._format_currency(detail.subtotal), self.styles.get_normal_style()),
            ])

        items_table = Table(
            items_data, 
            colWidths=[3.5*inch, 1.0*inch, 1.25*inch, 1.25*inch]
        )
        items_table.setStyle(TableStyle(self.table_styles.get_items_table_style()))
        content.append(items_table)
        content.append(Spacer(1, self.dimensions.SPACE_MEDIUM*inch))

        return content

    def _build_financial_summary(self) -> list:
        """
        Build the section with financial summary.
        
        Returns:
            list: List of items to add to the PDF
        """
        content = []

        # Calculate discount
        discount = self.invoice.subtotal + self.invoice.taxes - self.invoice.total
        if discount < 0:
            discount = Decimal(0)

        # Financial summary data
        summary_data = [
            [
                Paragraph("<b>Subtotal:</b>", self.styles.get_label_style()),
                Paragraph(self._format_currency(self.invoice.subtotal), self.styles.get_normal_style())
            ],
            [
                Paragraph("<b>IVA:</b>", self.styles.get_label_style()),
                Paragraph(self._format_currency(self.invoice.taxes), self.styles.get_normal_style())
            ],
            [
                Paragraph("<b>Descuento:</b>", self.styles.get_label_style()),
                Paragraph(self._format_currency(discount), self.styles.get_normal_style())
            ],
            [
                Paragraph("<b>TOTAL:</b>", self.styles.get_total_style()),
                Paragraph(self._format_currency(self.invoice.total), self.styles.get_total_style())
            ],
        ]

        summary_table = Table(summary_data, colWidths=[4.0*inch, 3.0*inch])
        summary_table.setStyle(TableStyle(self.table_styles.get_summary_table_style()))
        content.append(summary_table)
        content.append(Spacer(1, self.dimensions.SPACE_MEDIUM*inch))

        return content

    def _build_electronic_information(self) -> list:
        """
        Build the section with electronic information.
        
        Returns:
            list: List of items to add to the PDF
        """
        content = []

        # Title section
        content.append(
            Paragraph("<b>INFORMACIÓN ELECTRÓNICA</b>", self.styles.get_heading_style())
        )

        # Map DIAN status to display
        dian_status_map = {
            "PENDING": "Pendiente",
            "SENT": "Enviada",
            "ACCEPTED": "Aceptada",
            "REJECTED": "Rechazada",
            "ERROR": "Error"
        }
        dian_status = self.invoice.dian_status or ""
        dian_display = dian_status_map.get(dian_status, dian_status) or "No especificado"
        
        # Electronic information data
        electronic_data = [
            [
                Paragraph("<b>Estado DIAN:</b>", self.styles.get_label_style()),
                Paragraph(dian_display, self.styles.get_normal_style())
            ],
            [
                Paragraph("<b>Proveedor:</b>", self.styles.get_label_style()),
                Paragraph("Factus", self.styles.get_normal_style())
            ],
        ]

        electronic_table = Table(electronic_data, colWidths=[1.6*inch, 5.4*inch])
        electronic_table.setStyle(TableStyle(self.table_styles.get_data_table_style()))
        content.append(electronic_table)
        content.append(Spacer(1, self.dimensions.SPACE_MEDIUM*inch))

        return content

    def _build_observations(self) -> list:
        """
        Build the section with observations.
        Only displayed if there is content.
        
        Returns:
            list: List of items to add to the PDF
        """
        content = []

        # Check if there is a DIAN response message
        if self.invoice.dian_response_message and self.invoice.dian_response_message.strip():
            content.append(
                Paragraph("<b>OBSERVACIONES</b>", self.styles.get_heading_style())
            )
            observation_text = self.invoice.dian_response_message.replace(
                "\n", "<br/>&nbsp;&nbsp;&nbsp;"
            )
            content.append(
                Paragraph(
                    f"&nbsp;&nbsp;&nbsp;{observation_text}",
                    self.styles.get_normal_style()
                )
            )
            content.append(Spacer(1, self.dimensions.SPACE_SMALL*inch))

        return content

    def _build_footer(self) -> list:
        """
        Create the invoice footer.
        Include legal and generation information.
        
        Returns:
            list: List of items to add to the PDF
        """
        content = []

        # Divider line
        footer_line = Paragraph(
            "_" * 80,
            self.styles.get_footer_style()
        )
        content.append(footer_line)
        content.append(Spacer(1, 0.05*inch))

        # Generation information
        content.append(
            Paragraph(
                "<i>Documento generado por Sistema Hotel Sabana Brava 314</i>",
                self.styles.get_footer_style()
            )
        )

        # Generation date and time
        content.append(
            Paragraph(
                f"<i>Fecha y hora de generación: {datetime.now().strftime('%d de %B de %Y a las %H:%M:%S')}</i>",
                self.styles.get_footer_style()
            )
        )

        return content


def generate_invoice_pdf(
    db: Session,
    invoice_id: UUID,
    invoice_repository,
) -> StreamingResponse:
    """
    Public function to generate a PDF of an invoice.
    
    This function serves as an entry point from the invoices service.
    Verify that the invoice exists and delegate the generation to the 
    specialized generator.
    
    Args:
        db: Database session
        invoice_id: ID of the invoice to be generated
        invoice_repository: Invoice repository for database consultation
        
    Returns:
        StreamingResponse: PDF of the invoice ready for download
        
    Raises:
        HTTPException: If the invoice does not exist
    """
    # Validate invoice existence
    invoice = invoice_repository.get_invoice_by_id(db, invoice_id)

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    # Get company associated
    company = invoice.company

    # Create generator and get PDF
    generator = InvoicePDFGenerator(invoice, company)
    return generator.generate()


def generate_invoice_preview_pdf(
    invoice,
    company,
) -> StreamingResponse:
    """
    Generate a preview PDF without consulting or persisting an invoice.
    """
    generator = InvoicePDFGenerator(invoice, company)
    return generator.generate(
        content_disposition="inline",
        filename="invoice_preview.pdf"
    )


# End file:
