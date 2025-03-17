from pymongo import MongoClient
from file import PDFFile, Section
from typing import Optional
from bson import ObjectId

DATABASE = "book_ml_database";

class MongoDB:
    def __init__(self, mongo_db_connection):
        self.collection = MongoClient(mongo_db_connection).client[DATABASE]['pdf_files'];
    
    def save_pdf(self, pdf_file: PDFFile) -> int:
        """Save PDFFile to database"""
        pdf_dict = pdf_file.to_dict()
        result = self.collection.insert_one(pdf_dict)
        return result.inserted_id;
    
    def get_pdf(self, title: str) -> Optional[PDFFile]:
        """Retrieve PDFFile from database by title"""
        pdf_dict = self.collection.find_one({'title': title})
        
        if not pdf_dict:
            return None
            
        pdf_file = self.generatePDFFile(pdf_dict)
        return pdf_file

        
    def generatePDFFile(self, pdf_dict: dict) -> PDFFile:
        """Generate PDFFile instance from dictionary"""
        # Create new PDFFile instance
        pdf_file = PDFFile(filename=pdf_dict['filename'])
        pdf_file.set_metadata(
            title=pdf_dict['title'],
            author=pdf_dict['author']
        )
        pdf_file.set_text_content(pdf_dict['text_content'])
        
        # Add sections
        for section in pdf_dict['sections']:
            pdf_file.add_section(section['title'], section['content'])
            
        return pdf_file;
    
    def get_all_pdfs(self):
        """Get all PDFs (basic info only)"""
        return list(self.collection.find({}, {
            'title': 1,
            'author': 1
        }));