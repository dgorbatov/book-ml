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
        rewrite_query=True,
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

def query_question(question: str, file_store_id: str, vector_store_id: str) -> str:
    response = client.responses.create(
        model="gpt-4o-mini",
        input=question,
        tools=[{
            "type": "file_search",
            "vector_store_ids": [vector_store_id]
        }],
        include=["file_search_call.results"]
    )

    message = ""
    annotations = "";
    for i in response.output:
        if i.type == "file_search_call":
            annotations = i.results[0].text
        if i.type == "message":
            message = i.content[0].text
            # annotations = i.content[0].annotations


    # annotations = response.output[1].content[0].annotations
    
    # Get top-k retrieved filenames
    # retrieved_files = set([result.filename for result in annotations])

    # print(f'Files used: {retrieved_files}')
    # print(annotations)
    # print('Response:')
    # print(response.output[1].content[0].text) # 0 being the filesearch call

    return (message, annotations)
