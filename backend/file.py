from dataclasses import dataclass
from typing import List, Optional
from PyPDF2 import PdfReader

SIGNIFICANT_LENGTH_DIFFERENCE = 50 
MIN_WORDS_PER_PARAGRAPH = 20

@dataclass
class Section:
    content: str
    start_page: int
    end_page: int

@dataclass
class PDFFile:
    title: Optional[str]
    author: Optional[str]
    text_content: str
    sections: List[Section]
    filename: str
    
    def __init__(self, filename: str, title: Optional[str] = None, author: Optional[str] = None, text_content: str = ""):
        self.filename = filename
        self.title = title if title is not None else filename
        self.author = author
        self.text_content = text_content
        self.sections = []

    def get_all_sections(self) -> List[Section]:
        return self.sections
    
    def to_dict(self) -> dict:
        """Convert the PDFFile object to a dictionary"""
        return {
            "filename": self.filename,
            "title": self.title,
            "author": self.author,
            "text_content": self.text_content,
            "sections": [{
                "content": section.content,
                "start_page": section.start_page,
                "end_page": section.end_page
            } for section in self.sections]
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
        for section_data in data['sections']:
            pdf_file.sections.append(Section(
                content=section_data['content'],
                start_page=section_data['start_page'],
                end_page=section_data['end_page']
            ))
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
        return_file = PDFFile(
            filename=pdfstream.filename,
            title=doc.metadata.get('/Title', None),
            author=doc.metadata.get('/Author', None)
        )

        # Store text and page numbers for each chunk of text
        text_chunks = []  # List of (text, page_number) tuples
        full_text = ""
        
        for page_num, page in enumerate(doc.pages, 1):
            page_text = page.extract_text()
            if page_text.strip():  # Only add non-empty pages
                text_chunks.append((page_text, page_num))
                full_text += page_text + "\n"

        return_file.text_content = full_text
        return_file.extract_paragraphs(text_chunks)
        return return_file

    def extract_paragraphs(self, text_chunks: List[tuple[str, int]]) -> None:
        """Extract paragraphs from text chunks with page tracking."""
        current_paragraph = []
        current_start_page = None
        
        for i, (page_text, page_num) in enumerate(text_chunks):
            lines = page_text.split('\n')
            
            for j, current_line in enumerate(lines):
                current_line = current_line.strip()
                
                # Skip empty lines
                if not current_line:
                    if current_paragraph:
                        # Add completed paragraph
                        paragraph_text = ' '.join(current_paragraph)
                        if len(paragraph_text.split()) > MIN_WORDS_PER_PARAGRAPH:
                            self.sections.append(Section(
                                content=paragraph_text,
                                start_page=current_start_page,
                                end_page=page_num
                            ))
                        current_paragraph = []
                        current_start_page = None
                    continue
                
                # Start tracking new paragraph
                if not current_paragraph:
                    current_start_page = page_num
                
                current_paragraph.append(current_line)
                
                # Check for paragraph break if not at last line
                if j < len(lines) - 1:
                    next_line = lines[j + 1].strip()
                    if self.is_paragraph_break(current_line, next_line) and current_paragraph:
                        paragraph_text = ' '.join(current_paragraph)
                        if len(paragraph_text.split()) > MIN_WORDS_PER_PARAGRAPH:
                            self.sections.append(Section(
                                content=paragraph_text,
                                start_page=current_start_page,
                                end_page=page_num
                            ))
                        current_paragraph = []
                        current_start_page = None
        
        # Add the last paragraph if it exists
        if current_paragraph and current_start_page is not None:
            paragraph_text = ' '.join(current_paragraph)
            if len(paragraph_text.split()) > MIN_WORDS_PER_PARAGRAPH:
                self.sections.append(Section(
                    content=paragraph_text,
                    start_page=current_start_page,
                    end_page=text_chunks[-1][1]  # Last page number
                ))