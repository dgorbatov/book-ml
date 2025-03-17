from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import PyPDF2
from file import PDFFile
from database import MongoDB

app = Flask(__name__)
CORS(app)  # Allow requests from frontend

db = MongoDB("mongodb://localhost:27017/");

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "Backend is working!"})

@app.route('/api/upload', methods=['POST'])
def upload():
    if 'pdf' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['pdf']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    pdf_file = PDFFile.extract_information_from_pdf(file);
    db.save_pdf(pdf_file);
    return jsonify({
        "message": "File uploaded successfully!",
        "pdf_data": pdf_file.to_dict()
    })

@app.route('/api/get_pdf', methods=['GET'])
def get_pdf():
    title = request.args.get('title')
    pdf_file = db.get_pdf(title)
    return jsonify({
        "pdf_data": pdf_file.to_dict()
    })

@app.route('/api/get_all_pdfs', methods=['GET'])
def get_all_pdfs():
    return jsonify({
        "pdf_files": db.get_all_pdfs()
    })

if __name__ == '__main__':
    os.environ["FLASK_ENV"] = "development"
    app.run(debug=True)
