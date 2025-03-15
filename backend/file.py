from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime

@dataclass
class Section:
    title: str
    content: str

@dataclass
class PDFFile:
    title: Optional[str]
    author: Optional[str]
    creation_date: Optional[datetime]
    text_content: str
    sections: List[Section]
    filename: str
    
    def __init__(self, filename: str):
        self.filename = filename
        self.title = None
        self.author = None
        self.creation_date = None
        self.text_content = ""
        self.sections = []
    
    def add_section(self, title: str, content: str) -> None:
        """Add a new section to the PDF file"""
        self.sections.append(Section(title=title, content=content))
    
    def set_metadata(self, title: Optional[str], author: Optional[str], creation_date: Optional[datetime]) -> None:
        """Set the metadata for the PDF file"""
        self.title = title
        self.author = author
        self.creation_date = creation_date
    
    def set_text_content(self, content: str) -> None:
        """Set the full text content of the PDF"""
        self.text_content = content
    
    def get_all_sections(self) -> List[Section]:
        """Return all sections of the PDF"""
        return self.sections
    
    def get_section_by_title(self, title: str) -> Optional[Section]:
        """Return a specific section by its title"""
        for section in self.sections:
            if section.title.lower() == title.lower():
                return section
        return None
    
    def to_dict(self) -> dict:
        """Convert the PDFFile object to a dictionary"""
        return {
            "filename": self.filename,
            "title": self.title,
            "author": self.author,
            "creation_date": self.creation_date.isoformat() if self.creation_date else None,
            "text_content": self.text_content,
            "sections": [{"title": s.title, "content": s.content} for s in self.sections]
        }
    
    def __str__(self) -> str:
        """String representation of the PDFFile"""
        return f"PDFFile(filename='{self.filename}', title='{self.title}', author='{self.author}', sections={len(self.sections)})" 