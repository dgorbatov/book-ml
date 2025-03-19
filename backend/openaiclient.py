from openai import OpenAI
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from file import PDFFile
import os

load_dotenv("./vars.env")

OPEN_AI_API = os.getenv('OPEN_AI_API')

client = OpenAI(api_key=OPEN_AI_API)

def storeFile(file: PDFFile, filename) -> (str, str):
    fileResponse = client.files.create(
        file= (
            filename,
            file.text_content,
            "text"
        ),
        purpose="assistants"
    )

    vector_store = client.vector_stores.create(
        name=filename
    )

    vectorResponse = client.vector_stores.files.create(
        file_id=fileResponse.id,
        vector_store_id=vector_store.id
    )

    return (fileResponse.id, vector_store.id)

