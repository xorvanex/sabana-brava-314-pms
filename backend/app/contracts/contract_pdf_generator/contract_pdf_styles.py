# File path: backend/app/contracts/contract_pdf_generator/contract_pdf_styles.py

"""
Módulo de estilos para generación de PDFs de contratos.
Centraliza todos los estilos y colores para mantener consistencia visual
en los documentos PDF generados para contratos.
"""

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY


class ContractPDFStyles:
    """Clase que contiene todos los estilos reutilizables para PDFs de contratos"""
    
    @staticmethod
    def get_title_style():
        """
        Estilo para el título principal del documento
        Retorna el estilo para encabezados principales
        """
        style = getSampleStyleSheet()["Heading1"]
        style.fontSize = 16
        style.textColor = colors.HexColor("#1a1a1a")
        style.spaceAfter = 6
        style.alignment = TA_CENTER
        style.fontName = "Helvetica-Bold"
        return style

    @staticmethod
    def get_subtitle_style():
        """
        Estilo para subtítulos
        Usado para tipos de documentos o subtítulos principales
        """
        style = getSampleStyleSheet()["Heading2"]
        style.fontSize = 12
        style.textColor = colors.HexColor("#34495e")
        style.spaceAfter = 10
        style.alignment = TA_CENTER
        style.fontName = "Helvetica-Bold"
        return style

    @staticmethod
    def get_heading_style():
        """
        Estilo para títulos de sección
        Usado para títulos numerados (1. Información, 2. Detalles, etc.)
        """
        style = getSampleStyleSheet()["Heading3"]
        style.fontSize = 11
        style.textColor = colors.HexColor("#2c3e50")
        style.spaceAfter = 8
        style.spaceBefore = 12
        style.fontName = "Helvetica-Bold"
        return style

    @staticmethod
    def get_normal_style():
        """
        Estilo para texto del cuerpo/contenido normal
        Usado para párrafos regulares y contenido descriptivo
        """
        style = getSampleStyleSheet()["BodyText"]
        style.fontSize = 10
        style.alignment = TA_JUSTIFY
        style.spaceAfter = 6
        style.leading = 14
        return style

    @staticmethod
    def get_label_style():
        """
        Estilo para etiquetas en tablas
        Usado para identificadores de campos en tablas
        """
        style = getSampleStyleSheet()["Normal"]
        style.fontSize = 10
        style.textColor = colors.HexColor("#34495e")
        style.fontName = "Helvetica-Bold"
        return style

    @staticmethod
    def get_footer_style():
        """
        Estilo para pie de página/footer
        Usado para información secundaria al final del documento
        """
        style = getSampleStyleSheet()["Normal"]
        style.fontSize = 7.5
        style.textColor = colors.HexColor("#7f8c8d")
        style.alignment = TA_CENTER
        return style

    @staticmethod
    def get_small_text_style():
        """
        Estilo para texto pequeño
        Usado en notas y referencias
        """
        style = getSampleStyleSheet()["Normal"]
        style.fontSize = 8.5
        style.textColor = colors.HexColor("#7f8c8d")
        return style


class ContractPDFColors:
    """Clase que contiene todas las paletas de color para PDFs de contratos"""
    
    PRIMARY_DARK = colors.HexColor("#1a1a1a")        # Negro profundo
    SECONDARY_DARK = colors.HexColor("#2c3e50")      # Azul-gris oscuro
    BORDER_COLOR = colors.HexColor("#34495e")        # Azul-gris
    LIGHT_GRAY = colors.HexColor("#f8f9fa")          # Gris muy claro (filas)
    MEDIUM_GRAY = colors.HexColor("#bdc3c7")         # Gris medio
    HEADER_BG = colors.HexColor("#ecf0f1")           # Gris claro (encabezados)
    FOOTER_COLOR = colors.HexColor("#7f8c8d")        # Gris oscuro
    WHITE = colors.white
    BLACK = colors.black


class ContractPDFTableStyles:
    """Clase que contiene estilos reutilizables para tablas de contratos"""
    
    @staticmethod
    def get_header_table_style():
        """Estilo para tabla de encabezado (número, fecha, estado)"""
        return [
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (-1, -1), ContractPDFColors.HEADER_BG),
            ('GRID', (0, 0), (-1, -1), 1, ContractPDFColors.BORDER_COLOR),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]

    @staticmethod
    def get_data_table_style():
        """Estilo para tablas de datos (información, detalles)"""
        return [
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), 
             [ContractPDFColors.WHITE, ContractPDFColors.LIGHT_GRAY]),
            ('GRID', (0, 0), (-1, -1), 0.5, ContractPDFColors.MEDIUM_GRAY),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]

    @staticmethod
    def get_signature_table_style():
        """Estilo para tabla de firmas"""
        return [
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]


class ContractPDFDimensions:
    """Clase que contiene dimensiones estándar para PDFs de contratos"""
    
    # Márgenes estándar
    MARGIN = 0.75  # en inches
    
    # Espacios verticales
    SPACE_SMALL = 0.15  # Espacios pequeños
    SPACE_MEDIUM = 0.2  # Espacios medianos
    SPACE_LARGE = 0.25  # Espacios grandes
    SPACE_XLARGE = 0.3  # Espacios muy grandes
    
    # Anchos de columna para tablas
    FULL_WIDTH = 7.0  # Ancho total disponible
    HALF_WIDTH = 3.5
    THIRD_WIDTH = 2.33
    QUARTER_WIDTH = 1.75


# End file: