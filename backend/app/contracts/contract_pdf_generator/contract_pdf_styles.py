# File path: backend/app/contracts/contract_pdf_generator/contract_pdf_styles.py

# Start file:

"""
Style module for contract PDF generation.
Centralizes styles and colors to keep visual consistency
across generated contract PDF documents.
"""

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY


class ContractPDFStyles:
    """Reusable text styles for contract PDFs"""
    
    @staticmethod
    def get_title_style():
        """
        Main document title style
        Returns the style used by primary headings
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
        Subtitle style
        Used for document types and primary subtitles
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
        Section heading style
        Used for numbered headings such as 1. Information or 2. Details
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
        Body content style
        Used for regular paragraphs and descriptive content
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
        Table label style
        Used for field labels inside tables
        """
        style = getSampleStyleSheet()["Normal"]
        style.fontSize = 10
        style.textColor = colors.HexColor("#34495e")
        style.fontName = "Helvetica-Bold"
        return style

    @staticmethod
    def get_footer_style():
        """
        Footer text style
        Used for secondary information at the end of the document
        """
        style = getSampleStyleSheet()["Normal"]
        style.fontSize = 7.5
        style.textColor = colors.HexColor("#7f8c8d")
        style.alignment = TA_CENTER
        return style

    @staticmethod
    def get_small_text_style():
        """
        Small text style
        Used in notes and references
        """
        style = getSampleStyleSheet()["Normal"]
        style.fontSize = 8.5
        style.textColor = colors.HexColor("#7f8c8d")
        return style


class ContractPDFColors:
    """Color palette for contract PDFs"""
    
    PRIMARY_DARK = colors.HexColor("#1a1a1a")        # Deep black
    SECONDARY_DARK = colors.HexColor("#2c3e50")      # Dark blue-gray
    BORDER_COLOR = colors.HexColor("#34495e")        # Blue-gray
    LIGHT_GRAY = colors.HexColor("#f8f9fa")          # Very light gray for rows
    MEDIUM_GRAY = colors.HexColor("#bdc3c7")         # Medium gray
    HEADER_BG = colors.HexColor("#ecf0f1")           # Light gray for headers
    FOOTER_COLOR = colors.HexColor("#7f8c8d")        # Dark gray
    WHITE = colors.white
    BLACK = colors.black


class ContractPDFTableStyles:
    """Reusable table styles for contract PDFs"""
    
    @staticmethod
    def get_header_table_style():
        """Header table style for number, date, and status"""
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
        """Data table style for information and details"""
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
        """Signature table style"""
        return [
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]


class ContractPDFDimensions:
    """Standard dimensions for contract PDFs"""
    
    # Standard margins
    MARGIN = 0.75  # Inches
    
    # Vertical spacing
    SPACE_SMALL = 0.15  # Small spacing
    SPACE_MEDIUM = 0.2  # Medium spacing
    SPACE_LARGE = 0.25  # Large spacing
    SPACE_XLARGE = 0.3  # Extra-large spacing
    
    # Table column widths
    FULL_WIDTH = 7.0  # Available full width
    HALF_WIDTH = 3.5
    THIRD_WIDTH = 2.33
    QUARTER_WIDTH = 1.75

# End file:
