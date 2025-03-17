import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PDFList.css';

function PDFList() {
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPDFs();
    }, []);

    const fetchPDFs = async () => {
        try {
            const response = await fetch('/api/get_all_pdfs');
            const data = await response.json();
            
            if (response.ok) {
                setPdfs(data.pdf_files);
            } else {
                setError('Failed to fetch PDFs');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="pdf-list-loading">Loading PDFs...</div>;
    if (error) return <div className="pdf-list-error">{error}</div>;

    return (
        <div className="pdf-list-container">
            <h2>Uploaded PDFs</h2>
            {pdfs.length === 0 ? (
                <p>No PDFs uploaded yet. <Link to="/upload">Upload one now!</Link></p>
            ) : (
                <div className="pdf-grid">
                    {pdfs.map((pdf) => (
                        <div key={pdf.id} className="pdf-card">
                            <div className="pdf-icon">📄</div>
                            <div className="pdf-info">
                                <h3>{pdf.title || 'Untitled'}</h3>
                                <p className="pdf-author">
                                    {pdf.author ? `Author: ${pdf.author}` : 'No author'}
                                </p>
                                <p className="pdf-filename">
                                    {pdf.filename}
                                </p>
                            </div>
                            <div className="pdf-actions">
                                <button onClick={() => window.location.href = `/pdf/${pdf.id}`}>
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PDFList; 