from dataclasses import dataclass
from typing import List, Optional
from PyPDF2 import PdfReader

SIGNIFICANT_LENGTH_DIFFERENCE = 50 
MIN_WORDS_PER_PARAGRAPH = 20

@dataclass
class PDFFile:
    title: Optional[str]
    author: Optional[str]
    text_content: str
    sections: List[str]
    filename: str
    
    def __init__(self, filename: str, title: Optional[str] = None, author: Optional[str] = None, text_content: str = ""):
        self.filename = filename
        self.title = title
        self.author = author
        self.text_content = text_content
        self.sections = []

        self.extract_paragraphs()

    def get_all_sections(self) -> List[str]:
        return self.sections
    
    def to_dict(self) -> dict:
        """Convert the PDFFile object to a dictionary"""
        return {
            "filename": self.filename,
            "title": self.title,
            "author": self.author,
            "text_content": self.text_content,
            "sections": self.sections
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'PDFFile':
        """Create a PDFFile instance from a dictionary"""
        pdf_file = cls(
            filename=data['filename'],
            title=data['title'],
            author=data['author'], 
            text_content=data['text_content']
        )
        return pdf_file
    
    def __str__(self) -> str:
        return f"PDFFile(filename='{self.filename}', title='{self.title}', author='{self.author}', sections={len(self.sections)})"

    """
        Determine if there's a paragraph break between two lines.
        Rules:
        1. Empty line indicates paragraph break
        2. Line ending with period followed by indented line
        3. Significant difference in line lengths might indicate paragraph break
    """
    @staticmethod
    def is_paragraph_break(current_line: str, next_line: str) -> bool:
        if not current_line.strip() or not next_line.strip():
            return True
        
        # Check if current line ends with sentence-ending punctuation
        ends_with_period = current_line.rstrip().endswith(('.', '!', '?'))
        
        # Check if next line is indented
        next_line_indented = next_line.startswith('    ') or next_line.startswith('\t')
        
        # Check for significant length difference (might indicate new paragraph)
        significant_length_diff = abs(len(current_line.strip()) - len(next_line.strip())) > SIGNIFICANT_LENGTH_DIFFERENCE
        
        return (ends_with_period and next_line_indented) or significant_length_diff

    @staticmethod
    def extract_information_from_pdf(pdfstream) -> 'PDFFile':
        doc = PdfReader(pdfstream)

        full_text = ""
        # First pass: collect all text
        for page in doc.pages:
            page_text = page.extract_text()
            full_text += page_text + "\n"

        return_file = PDFFile(
            filename=pdfstream.filename,
            title=doc.metadata.get('/Title', None),
            author=doc.metadata.get('/Author', None),
            text_content=full_text
        )

        return return_file

    def extract_paragraphs(self):
        """Extract paragraphs from text."""
        lines = self.text_content.split('\n')
        paragraphs = []
        current_paragraph = []
        
        for i in range(len(lines)):
            current_line = lines[i].strip()
            
            # Skip empty lines
            if not current_line:
                if current_paragraph:
                    paragraphs.append(' '.join(current_paragraph))
                    current_paragraph = []
            else:        
                current_paragraph.append(current_line)
                
                # Check for paragraph break if not at last line of book
                if i < len(lines) - 1:
                    next_line = lines[i + 1].strip()
                    if PDFFile.is_paragraph_break(current_line, next_line) and current_paragraph:
                        paragraphs.append(' '.join(current_paragraph))
                        current_paragraph = []
        
        # Add the last paragraph if exists
        if current_paragraph:
            paragraphs.append(' '.join(current_paragraph))

        # Add each paragraph as a section
        for paragraph in paragraphs:
            if len(paragraph.split()) > MIN_WORDS_PER_PARAGRAPH:
                self.sections.append(paragraph)