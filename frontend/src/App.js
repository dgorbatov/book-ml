import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
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

    console.log(selectedFile);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            headers: {
              // Don't set Content-Type header when sending FormData
              // It will be automatically set with the correct boundary
            }
        });
        const data = await response.json();
      
        if (response.ok) {
            setUploadStatus('File uploaded successfully!');
            // setSelectedFile(null);
        } else {
            setUploadStatus(`Upload failed: ${data.message}`);
        }
    } catch (error) {
      setUploadStatus('Upload failed: ' + error.message);
    }
  };

  return (
    <div className="App">
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
    </div>
  );
}

export default App;
