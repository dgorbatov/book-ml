from pymongo import MongoClient
from file import PDFFile
from typing import Optional
from bson import ObjectId

DATABASE = "book_ml_database";

class MongoDB:
    def __init__(self, mongo_db_connection):
        self.collection = MongoClient(mongo_db_connection).client[DATABASE]['pdf_files'];
    
    def save_pdf(self, pdf_file: PDFFile) -> int:
        return self.collection.insert_one(pdf_file.to_dict()).inserted_id;
    
    def get_pdf(self, title: str) -> Optional[PDFFile]:
        """Retrieve PDFFile from database by title"""
        pdf_dict = self.collection.find_one({'title': title})
        
        if not pdf_dict:
            return None
        return PDFFile.from_dict(pdf_dict)

    def get_all_pdfs(self) -> list[dict]:
        """Get all PDFs (basic info only)"""

        pdfs =  self.collection.find({}, {
            'title': 1,
            'author': 1
        });

        ret = [{ "title": i["title"], "author": i["author"] } for i in pdfs];


        return ret;