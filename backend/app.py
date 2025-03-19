from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import PyPDF2
from file import PDFFile
from database import MongoDB
from dotenv import load_dotenv
from openai import OpenAI


load_dotenv("./vars.env")

OPEN_AI_API = os.getenv('OPEN_AI_API')

client = OpenAI(api_key=OPEN_AI_API)

response = client.embeddings.create(
    input="Your text string goes here",
    model="text-embedding-3-small"
)

print(response.data[0].embedding)


app = Flask(__name__)
CORS(app)  # Allow requests from frontend

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
        pdf_file = PDFFile.extract_information_from_pdf(file)
        db.save_pdf(pdf_file)
    except Exception as e:
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

if __name__ == '__main__':
    os.environ["FLASK_ENV"] = "development"
    app.run(debug=True)
