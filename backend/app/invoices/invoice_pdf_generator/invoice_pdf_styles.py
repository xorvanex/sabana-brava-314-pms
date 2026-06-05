"""
Style module for invoice PDF generation.
Centralizes styles and colors to keep visual consistency
across generated invoice PDF documents.
"""

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_RIGHT


class InvoicePDFStyles:
    """Reusable text styles for invoice PDFs"""
    
    @staticmethod
    def get_invoice_title_style():
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
    def get_invoice_subtitle_style():
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
    def get_total_style():
        """
        Total amount style
        Used for highlighting the final total
        """
        style = getSampleStyleSheet()["Heading3"]
        style.fontSize = 12
        style.textColor = colors.HexColor("#1a1a1a")
        style.fontName = "Helvetica-Bold"
        style.spaceBefore = 8
        return style

    @staticmethod
    def get_status_style():
        """
        Status text style
        Used for displaying invoice status
        """
        style = getSampleStyleSheet()["Normal"]
        style.fontSize = 10
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


class InvoicePDFColors:
    """Color palette for invoice PDFs"""
    
    PRIMARY_DARK = colors.HexColor("#1a1a1a")        # Deep black
    SECONDARY_DARK = colors.HexColor("#2c3e50")    # Dark blue-gray
    BORDER_COLOR = colors.HexColor("#34495e")        # Blue-gray
    LIGHT_GRAY = colors.HexColor("#f8f9fa")         # Very light gray for rows
    MEDIUM_GRAY = colors.HexColor("#bdc3c7")         # Medium gray
    HEADER_BG = colors.HexColor("#ecf0f1")          # Light gray for headers
    FOOTER_COLOR = colors.HexColor("#7f8c8d")       # Dark gray
    ACCENT_GREEN = colors.HexColor("#27ae60")       # Green for totals
    WHITE = colors.white
    BLACK = colors.black


class InvoicePDFTableStyles:
    """Reusable table styles for invoice PDFs"""
    
    @staticmethod
    def get_header_table_style():
        """Header table style for number, date, and status"""
        return [
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (-1, -1), InvoicePDFColors.HEADER_BG),
            ('GRID', (0, 0), (-1, -1), 1, InvoicePDFColors.BORDER_COLOR),
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
             [InvoicePDFColors.WHITE, InvoicePDFColors.LIGHT_GRAY]),
            ('GRID', (0, 0), (-1, -1), 0.5, InvoicePDFColors.MEDIUM_GRAY),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]

    @staticmethod
    def get_items_table_style():
        """Items table style for invoice line items"""
        return [
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
            ('ALIGN', (3, 0), (3, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (-1, 0), InvoicePDFColors.HEADER_BG),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), 
             [InvoicePDFColors.WHITE, InvoicePDFColors.LIGHT_GRAY]),
            ('GRID', (0, 0), (-1, -1), 0.5, InvoicePDFColors.MEDIUM_GRAY),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]

    @staticmethod
    def get_summary_table_style():
        """Summary table style for financial totals"""
        return [
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LINEABOVE', (0, 0), (-1, -1), 1, InvoicePDFColors.MEDIUM_GRAY),
            ('LINEABOVE', (0, -1), (-1, -1), 2, InvoicePDFColors.PRIMARY_DARK),
        ]

    @staticmethod
    def get_total_row_style():
        """Total row style for the final total"""
        return [
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('TEXTCOLOR', (0, 0), (-1, -1), InvoicePDFColors.PRIMARY_DARK),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]


class InvoicePDFDimensions:
    """Standard dimensions for invoice PDFs"""
    
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
