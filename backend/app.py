from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import PyPDF2
from upload import extract_information_from_pdf

app = Flask(__name__)
CORS(app)  # Allow requests from frontend

@app.route('/api/test', methods=['GET'])
def test():
    print("INSIDE");
    return jsonify({"message": "Backend is working!"})

@app.route('/api/upload', methods=['POST'])
def upload():
    if 'pdf' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['pdf']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    print(f"Received file: {file.filename}")

    pdf_file = extract_information_from_pdf(file)
    
    # Convert PDFFile object to dictionary for JSON response
    return jsonify({
        "message": "File uploaded successfully!",
        "pdf_data": pdf_file.to_dict()
    })

if __name__ == '__main__':
    os.environ["FLASK_ENV"] = "development"
    app.run(debug=True)
