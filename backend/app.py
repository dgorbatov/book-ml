from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from file import PDFFile
from database import MongoDB
from openaiclient import storeFile, query_question
from PyPDF2 import PdfReader
from io import BytesIO
app = Flask(__name__)
CORS(app) 

db = MongoDB("mongodb://localhost:27017/")

# Error handler for all errors
@app.errorhandler(Exception)
def handle_error(error):
    code = 500
    if hasattr(error, 'code'):
        code = error.code
    return jsonify({"error": str(error)}), code

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "Backend is working!"})

@app.route('/api/upload', methods=['POST'])
def upload():
    if 'pdf' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['pdf']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400


    try:
        doc = PdfReader(file)
        pdf_file = PDFFile.extract_information_from_pdf(doc, file.filename, "", "")

        file_store_id, vector_store_id = storeFile(pdf_file, file.filename)

        pdf_file.file_store_id = file_store_id
        pdf_file.vector_store_id = vector_store_id

        print(file_store_id, ":", vector_store_id);

        db.save_pdf(pdf_file)
    except Exception as e:
        print(e);
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "message": "File uploaded successfully!",
        "pdf_data": pdf_file.to_dict()
    })

@app.route('/api/get_pdf', methods=['GET'])
def get_pdf():
    title = request.args.get('title')

    if title is None:
        return jsonify({"error": "Title is required"}), 400

    pdf_file = db.get_pdf(title)
    if pdf_file is None:
        return jsonify({"error": "PDF not found"}), 404

    return jsonify({
        "pdf_data": pdf_file.to_dict()
    })

@app.route('/api/get_all_pdfs', methods=['GET'])
def get_all_pdfs():
    try:
        pdfs = db.get_all_pdfs()
        return jsonify({
            "pdf_files": pdfs
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/askquestion', methods=['GET'])
def ask_question():
    title = request.args.get('title')
    question = request.args.get('question')

    if title is None or question is None:
        return jsonify({"error": "Title and question are required"}), 400

    pdf_file = db.get_pdf(title)
    if pdf_file is None:
        return jsonify({"error": "PDF not found"}), 404

    answer = query_question(question, pdf_file.file_store_id, pdf_file.vector_store_id);

    return jsonify({
        "answer": answer[0],
        "annotations": answer[1]
    })


if __name__ == '__main__':
    os.environ["FLASK_ENV"] = "development"
    app.run(debug=True)
