import { useState } from 'react';
import './Upload.css';

function Upload() {
  const [selectedFile, setSelectedFile] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [pdfData, setPdfData] = useState(null);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    setPdfData(null);
    if (!selectedFile) {
      setUploadStatus('Please select a file first');
      return;
    }

    if (!selectedFile.type.includes('pdf')) {
      setUploadStatus('Please upload a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
      
        if (response.ok) {
            setUploadStatus('File uploaded successfully!');
            setPdfData(data.pdf_data);
        } else {
            setUploadStatus(`Upload failed: ${data.error}`);
        }
    } catch (error) {
      setUploadStatus('Upload failed: ' + error.message);
    }
  };

  return (
    <div className="container">
        <div className="upload-controls">
            <h2>Upload PDF</h2>
            <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                style={{margin: '10px 0'}}
            />
            <button 
                onClick={handleUpload}
                style={{
                    padding: '8px 16px',
                    backgroundColor: '#61dafb',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginLeft: '10px'
                }}
            >
                Upload PDF
            </button>
            {uploadStatus && (
                <p style={{
                    margin: '10px 0',
                    color: uploadStatus.includes('success') ? 'green' : 'red'
                }}>
                    {uploadStatus}
                </p>
            )}
            {selectedFile && (
                <p>Selected file: {selectedFile.name}</p>
            )}
            {pdfData && (
                <div className="pdf-metadata">
                    <h3>PDF Information</h3>
                    <p><strong>Title:</strong> {pdfData.title || 'Not available'}</p>
                    <p><strong>Author:</strong> {pdfData.author || 'Not available'}</p>
                </div>
            )}
        </div>
        <div className="pdf-viewer">
            {selectedFile && (
                <object
                    data={URL.createObjectURL(selectedFile)}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                >
                    <p>Your browser does not support PDF preview.</p>
                </object>
            )}
        </div>
    </div>
  );
}

export default Upload; 