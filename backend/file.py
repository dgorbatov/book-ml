from dataclasses import dataclass
from typing import Optional
from PyPDF2 import PdfReader

@dataclass
class PDFFile:
    title: Optional[str]
    author: Optional[str]
    text_content: str
    filename: str
    
    def __init__(self, filename: str, vector_store_id: str, file_store_id: str, title: Optional[str] = None, author: Optional[str] = None, text_content: str = ""):
        self.filename = filename
        self.vector_store_id = vector_store_id
        self.file_store_id = file_store_id
        self.title = title if title is not None else filename
        self.author = author
        self.text_content = text_content
    
    def to_dict(self) -> dict:
        """Convert the PDFFile object to a dictionary"""
        return {
            "filename": self.filename,
            "title": self.title,
            "author": self.author,
            "text_content": self.text_content,
            "vector_store_id": self.vector_store_id,
            "file_store_id": self.file_store_id
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'PDFFile':
        """Create a PDFFile instance from a dictionary"""
        return cls(
            filename=data['filename'],
            title=data['title'],
            author=data['author'], 
            text_content=data['text_content'],
            vector_store_id=data['vector_store_id'],
            file_store_id=data['file_store_id']
        )
    
    def __str__(self) -> str:
        return f"PDFFile(filename='{self.filename}', title='{self.title}', author='{self.author}')"

    @staticmethod
    def extract_information_from_pdf(doc: PdfReader, filename: str, vector_store_id: str, file_store_id: str) -> 'PDFFile':
        return_file = PDFFile(
            filename=filename,
            vector_store_id=vector_store_id,
            file_store_id=file_store_id,
            title=doc.metadata.get('/Title', None),
            author=doc.metadata.get('/Author', None)
        )

        # Extract full text content
        full_text = ""
        for page in doc.pages:
            page_text = page.extract_text()
            if page_text.strip():  # Only add non-empty pages
                full_text += "<br>" + page_text;

        return_file.text_content = full_text
        return return_file