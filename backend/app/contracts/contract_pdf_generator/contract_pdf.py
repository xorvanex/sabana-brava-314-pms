# File path: backend/app/contracts/contract_pdf_generator/contract_pdf.py

"""
Módulo especializado en la generación de PDFs para contratos.
Maneja toda la lógica de renderizado de contratos en formato PDF.
"""

from datetime import datetime
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

from .contract_pdf_styles import (
    ContractPDFStyles,
    ContractPDFColors,
    ContractPDFTableStyles,
    ContractPDFDimensions,
)


class ContractPDFGenerator:
    """
    Clase responsable de la generación de PDFs para contratos.
    Encapsula toda la lógica de rendering y estructura del documento.
    """

    def __init__(self, contract, company):
        """
        Inicializa el generador con datos del contrato y empresa.
        
        Args:
            contract: Objeto del contrato de la base de datos
            company: Objeto de la empresa asociada al contrato
        """
        self.contract = contract
        self.company = company
        self.styles = ContractPDFStyles()
        self.colors = ContractPDFColors()
        self.table_styles = ContractPDFTableStyles()
        self.dimensions = ContractPDFDimensions()

    def generate(
        self,
        content_disposition: str = "attachment",
        filename: str | None = None
    ) -> StreamingResponse:
        """
        Genera el PDF del contrato y retorna una respuesta streaming.
        
        Returns:
            StreamingResponse: PDF listo para descargar
        """
        # Crear buffer en memoria para el PDF
        pdf_buffer = BytesIO()

        # Configurar documento PDF con márgenes profesionales
        pdf = SimpleDocTemplate(
            pdf_buffer,
            pagesize=(8.5*inch, 11*inch),
            rightMargin=self.dimensions.MARGIN*inch,
            leftMargin=self.dimensions.MARGIN*inch,
            topMargin=self.dimensions.MARGIN*inch,
            bottomMargin=self.dimensions.MARGIN*inch,
            title=f"Contrato_{self.contract.contract_number}"
        )

        # Construir contenido del PDF
        content = []
        content.extend(self._build_header())
        content.extend(self._build_company_info())
        content.extend(self._build_contract_details())
        content.extend(self._build_rooms())
        content.extend(self._build_terms_and_conditions())
        content.extend(self._build_additional_notes())
        content.extend(self._build_signatures())
        content.extend(self._build_footer())

        # Generar PDF en memoria
        pdf.build(content)
        pdf_buffer.seek(0)

        pdf_filename = filename or f"contract_{self.contract.contract_number}.pdf"

        # Retornar respuesta con streaming
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition":
                f"{content_disposition}; filename={pdf_filename}"
            }
        )

    def _build_header(self) -> list:
        """
        Construye la sección de encabezado del contrato.
        Incluye nombre del hotel, tipo de documento e información general.
        
        Returns:
            list: Lista de elementos para agregar al PDF
        """
        content = []

        # Nombre del hotel
        content.append(
            Paragraph(
                "<b>HOTEL SABANA BRAVA 314</b>",
                self.styles.get_title_style()
            )
        )

        # Tipo de contrato
        content.append(
            Paragraph(
                "CONTRATO DE HOSPEDAJE CORPORATIVO",
                self.styles.get_subtitle_style()
            )
        )
        content.append(Spacer(1, self.dimensions.SPACE_SMALL*inch))

        # Tabla con información general del contrato
        header_data = [[
            Paragraph(
                f"<b>No. de Contrato:</b><br/>{self.contract.contract_number}",
                self.styles.get_label_style()
            ),
            Paragraph(
                f"<b>Fecha de emisión:</b><br/>{datetime.now().strftime('%d de %B de %Y')}",
                self.styles.get_label_style()
            ),
            Paragraph(
                f"<b>Estado:</b><br/>{'Activo' if self.contract.is_active else 'Inactivo'}",
                self.styles.get_label_style()
            )
        ]]

        header_table = Table(header_data, colWidths=[2.2*inch, 2.2*inch, 2.2*inch])
        header_table.setStyle(TableStyle(self.table_styles.get_header_table_style()))
        content.append(header_table)
        content.append(Spacer(1, self.dimensions.SPACE_MEDIUM*inch))

        return content

    def _build_company_info(self) -> list:
        """
        Construye la sección con información de la empresa cliente.
        
        Returns:
            list: Lista de elementos para agregar al PDF
        """
        content = []

        # Título de sección
        content.append(
            Paragraph("<b>1. INFORMACIÓN DEL CLIENTE</b>", self.styles.get_heading_style())
        )

        # Datos de la empresa en tabla
        company_data = [
            [
                Paragraph("<b>Razón Social:</b>", self.styles.get_label_style()),
                Paragraph(
                    self.company.name if self.company.name else "No especificado",
                    self.styles.get_normal_style()
                )
            ],
            [
                Paragraph("<b>NIT/Identificación:</b>", self.styles.get_label_style()),
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
                Paragraph("<b>Teléfono:</b>", self.styles.get_label_style()),
                Paragraph(
                    self.company.phone if self.company.phone else "No especificado",
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
        ]

        company_table = Table(company_data, colWidths=[1.6*inch, 5.4*inch])
        company_table.setStyle(TableStyle(self.table_styles.get_data_table_style()))
        content.append(company_table)
        content.append(Spacer(1, self.dimensions.SPACE_MEDIUM*inch))

        return content

    def _build_contract_details(self) -> list:
        """
        Construye la sección con detalles del contrato.
        Incluye fechas, tarifas y duración.
        
        Returns:
            list: Lista de elementos para agregar al PDF
        """
        content = []

        # Título de sección
        content.append(
            Paragraph("<b>2. DETALLES DEL CONTRATO</b>", self.styles.get_heading_style())
        )

        # Calcular duración del contrato
        contract_duration = (self.contract.end_date - self.contract.start_date).days

        # Datos del contrato en tabla
        contract_data = [
            [
                Paragraph("<b>Fecha de Inicio:</b>", self.styles.get_label_style()),
                Paragraph(
                    self.contract.start_date.strftime('%d de %B de %Y'),
                    self.styles.get_normal_style()
                ),
            ],
            [
                Paragraph("<b>Fecha de Finalización:</b>", self.styles.get_label_style()),
                Paragraph(
                    self.contract.end_date.strftime('%d de %B de %Y'),
                    self.styles.get_normal_style()
                ),
            ],
            [
                Paragraph("<b>Tarifa Base Diaria:</b>", self.styles.get_label_style()),
                Paragraph(
                    f"${self.contract.base_rate:,.2f} COP",
                    self.styles.get_normal_style()
                ),
            ],
            [
                Paragraph("<b>Duración del Contrato:</b>", self.styles.get_label_style()),
                Paragraph(
                    f"{contract_duration} días",
                    self.styles.get_normal_style()
                ),
            ],
        ]

        contract_table = Table(contract_data, colWidths=[2*inch, 5*inch])
        contract_table.setStyle(TableStyle(self.table_styles.get_data_table_style()))
        content.append(contract_table)
        content.append(Spacer(1, self.dimensions.SPACE_MEDIUM*inch))

        return content

    def _build_rooms(self) -> list:
        """
        Construye la sección con habitaciones asociadas al contrato.
        
        Returns:
            list: Lista de elementos para agregar al PDF
        """
        content = []

        if not self.contract.rooms:
            return content

        content.append(
            Paragraph("<b>3. HABITACIONES ASOCIADAS</b>", self.styles.get_heading_style())
        )

        room_data = [[
            Paragraph("<b>Número</b>", self.styles.get_label_style()),
            Paragraph("<b>Capacidad</b>", self.styles.get_label_style()),
            Paragraph("<b>Estado</b>", self.styles.get_label_style()),
            Paragraph("<b>Descripción</b>", self.styles.get_label_style()),
        ]]

        for room in self.contract.rooms:
            room_data.append([
                Paragraph(room.room_number, self.styles.get_normal_style()),
                Paragraph(str(room.capacity), self.styles.get_normal_style()),
                Paragraph(str(room.status.value), self.styles.get_normal_style()),
                Paragraph(room.description or "No especificada", self.styles.get_normal_style()),
            ])

        room_table = Table(room_data, colWidths=[1.2*inch, 1.1*inch, 1.5*inch, 3.2*inch])
        room_table.setStyle(TableStyle(self.table_styles.get_data_table_style()))
        content.append(room_table)
        content.append(Spacer(1, self.dimensions.SPACE_MEDIUM*inch))

        return content

    def _build_terms_and_conditions(self) -> list:
        """
        Construye la sección con términos y condiciones del contrato.
        
        Returns:
            list: Lista de elementos para agregar al PDF
        """
        content = []

        # Título de sección
        content.append(
            Paragraph("<b>4. TÉRMINOS Y CONDICIONES</b>", self.styles.get_heading_style())
        )

        # Mostrar términos o texto por defecto
        if self.contract.terms and self.contract.terms.strip():
            terms_text = self.contract.terms.replace("\n", "<br/>&nbsp;&nbsp;&nbsp;")
            content.append(
                Paragraph(f"&nbsp;&nbsp;&nbsp;{terms_text}", self.styles.get_normal_style())
            )
        else:
            content.append(
                Paragraph(
                    "&nbsp;&nbsp;&nbsp;Los términos y condiciones serán definidos y acordados "
                    "entre las partes de acuerdo al negociado y formalizado.",
                    self.styles.get_normal_style()
                )
            )

        content.append(Spacer(1, self.dimensions.SPACE_SMALL*inch))

        return content

    def _build_additional_notes(self) -> list:
        """
        Construye la sección con notas adicionales del contrato.
        Solo se muestra si hay contenido.
        
        Returns:
            list: Lista de elementos para agregar al PDF
        """
        content = []

        if self.contract.description and self.contract.description.strip():
            content.append(
                Paragraph("<b>5. NOTAS ADICIONALES</b>", self.styles.get_heading_style())
            )
            description_text = self.contract.description.replace("\n", "<br/>&nbsp;&nbsp;&nbsp;")
            content.append(
                Paragraph(
                    f"&nbsp;&nbsp;&nbsp;{description_text}",
                    self.styles.get_normal_style()
                )
            )
            content.append(Spacer(1, self.dimensions.SPACE_SMALL*inch))

        return content

    def _build_signatures(self) -> list:
        """
        Construye la sección de firmas del contrato.
        Incluye espacios para firmas de ambas partes.
        
        Returns:
            list: Lista de elementos para agregar al PDF
        """
        content = []

        # Espacio antes de firmas
        content.append(Spacer(1, self.dimensions.SPACE_LARGE*inch))

        # Título de sección
        content.append(
            Paragraph("<b>6. FIRMAS DE ACEPTACIÓN</b>", self.styles.get_heading_style())
        )
        content.append(Spacer(1, self.dimensions.SPACE_MEDIUM*inch))

        # Tabla de firmas
        signature_data = [
            [
                Paragraph("<b>POR LA EMPRESA CLIENTE</b>", self.styles.get_label_style()),
                Paragraph(""),
                Paragraph("<b>POR EL HOTEL SABANA BRAVA 314</b>", self.styles.get_label_style()),
            ],
            [
                Paragraph(""),
                Paragraph(""),
                Paragraph(""),
            ],
            [
                Paragraph("_" * 28, self.styles.get_normal_style()),
                Paragraph(""),
                Paragraph("_" * 28, self.styles.get_normal_style()),
            ],
            [
                Paragraph("<u>Nombre y Firma</u>", self.styles.get_label_style()),
                Paragraph(""),
                Paragraph("<u>Nombre y Firma</u>", self.styles.get_label_style()),
            ],
            [
                Paragraph(""),
                Paragraph(""),
                Paragraph(""),
            ],
            [
                Paragraph("Cédula: ________________", self.styles.get_normal_style()),
                Paragraph(""),
                Paragraph("Cédula: ________________", self.styles.get_normal_style()),
            ],
            [
                Paragraph("Fecha: _________________", self.styles.get_normal_style()),
                Paragraph(""),
                Paragraph("Fecha: _________________", self.styles.get_normal_style()),
            ],
        ]

        signature_table = Table(signature_data, colWidths=[2.2*inch, 0.3*inch, 2.2*inch])
        signature_table.setStyle(TableStyle(self.table_styles.get_signature_table_style()))
        content.append(signature_table)
        content.append(Spacer(1, self.dimensions.SPACE_LARGE*inch))

        return content

    def _build_footer(self) -> list:
        """
        Construye el pie de página del contrato.
        Incluye información legal y de generación.
        
        Returns:
            list: Lista de elementos para agregar al PDF
        """
        content = []

        # Línea divisoria
        footer_line = Paragraph(
            "_" * 80,
            self.styles.get_footer_style()
        )
        content.append(footer_line)
        content.append(Spacer(1, 0.05*inch))

        # Texto de descargo legal
        content.append(
            Paragraph(
                "<i>Este contrato ha sido generado electrónicamente por el Sistema de Gestión "
                "Hotelera del Hotel Sabana Brava 314. Todos los datos aquí contenidos son "
                "confidenciales.</i>",
                self.styles.get_footer_style()
            )
        )

        return content


def generate_contract_pdf(
    db: Session,
    contract_id: UUID,
    contract_repository,
) -> StreamingResponse:
    """
    Función pública para generar PDF de un contrato.
    
    Esta función sirve como punto de entrada desde el servicio de contratos.
    Valida que el contrato exista y delega la generación al generador especializado.
    
    Args:
        db: Sesión de base de datos
        contract_id: ID del contrato a generar
        contract_repository: Repositorio de contratos para consultar BD
        
    Returns:
        StreamingResponse: PDF del contrato listo para descargar
        
    Raises:
        HTTPException: Si el contrato no existe
    """
    # Validar existencia del contrato
    contract = contract_repository.get_contract_by_id(db, contract_id)

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    # Obtener empresa asociada
    company = contract.company

    # Crear generador y obtener PDF
    generator = ContractPDFGenerator(contract, company)
    return generator.generate()


def generate_contract_preview_pdf(
    contract,
    company,
) -> StreamingResponse:
    """
    Genera un PDF de vista previa sin consultar ni persistir un contrato.
    """
    generator = ContractPDFGenerator(contract, company)
    return generator.generate(
        content_disposition="inline",
        filename='"contract_preview.pdf"'
    )


# End file:
