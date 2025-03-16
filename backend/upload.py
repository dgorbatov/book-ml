from io import BytesIO
from PyPDF2 import PdfReader
import re
from file import PDFFile

def is_paragraph_break(current_line: str, next_line: str) -> bool:
    """
    Determine if there's a paragraph break between two lines.
    Rules:
    1. Empty line indicates paragraph break
    2. Line ending with period followed by indented line
    3. Significant difference in line lengths might indicate paragraph break
    """
    if not current_line.strip() or not next_line.strip():
        return True
    
    # Check if current line ends with sentence-ending punctuation
    ends_with_period = current_line.rstrip().endswith(('.', '!', '?'))
    
    # Check if next line is indented
    next_line_indented = next_line.startswith('    ') or next_line.startswith('\t')
    
    # Check for significant length difference (might indicate new paragraph)
    length_difference = abs(len(current_line.strip()) - len(next_line.strip()))
    significant_length_diff = length_difference > 50  # Adjustable threshold
    
    return (ends_with_period and next_line_indented) or significant_length_diff

def extract_paragraphs(text: str) -> list:
    """Extract paragraphs from text."""
    lines = text.split('\n')
    paragraphs = []
    current_paragraph = []
    
    for i in range(len(lines)):
        current_line = lines[i].strip()
        
        # Skip empty lines
        if not current_line:
            if current_paragraph:
                paragraphs.append(' '.join(current_paragraph))
                current_paragraph = []
            continue
        
        current_paragraph.append(current_line)
        
        # Check for paragraph break if not at last line
        if i < len(lines) - 1:
            next_line = lines[i + 1].strip()
            if is_paragraph_break(current_line, next_line):
                if current_paragraph:
                    paragraphs.append(' '.join(current_paragraph))
                    current_paragraph = []
    
    # Add the last paragraph if exists
    if current_paragraph:
        paragraphs.append(' '.join(current_paragraph))
    
    return paragraphs

def extract_information_from_pdf(pdfstream):
    doc = PdfReader(pdfstream)
    pdf_file = PDFFile(filename=pdfstream.name)
    
    # Extract and set metadata
    metadata = doc.metadata
    pdf_file.set_metadata(
        title=metadata.get('/Title', None),
        author=metadata.get('/Author', None)
    )
    
    full_text = ""
    # First pass: collect all text
    for page in doc.pages:
        page_text = page.extract_text()
        full_text += page_text + "\n"
    
    # Set the full text content
    pdf_file.set_text_content(full_text)
    
    # Extract paragraphs
    paragraphs = extract_paragraphs(full_text)

    print(len(paragraphs));
    
    # Add each paragraph as a section
    for i, paragraph in enumerate(paragraphs, 1):
        # Skip very short paragraphs (likely headers or noise)
        if len(paragraph.split()) > 10:  # Minimum 10 words
            pdf_file.add_section(f"Paragraph {i}", paragraph)
    
    return pdf_file