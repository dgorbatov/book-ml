import React, { useState, useEffect, use } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PDFView.css';
import ReactMarkdown from 'react-markdown';
import BookContent from './BookContent';
import ChatPanel from './ChatPanel';

function PDFView() {
    const [pdfData, setPdfData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { title } = useParams();
    const [selectedText, setSelectedText] = useState([]);
    const [annotations, setAnnotations] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch PDF Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/get_pdf?title=${encodeURIComponent(title)}`);
                const data = await response.json();
                
                if (response.ok) {
                    setPdfData(data.pdf_data);
                } else {
                    setError(data.error || 'Failed to fetch PDF data');
                }
            } catch (err) {
                setError('Error connecting to server');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [title]);

    const handleTextSelection = () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text) {
            setSelectedText(prevSelected => [...prevSelected, text]);
        }
    };

    if (loading) return <div className="pdf-view-loading">Loading PDF data...</div>;
    if (error) return (
        <div className="pdf-view-error">
            <p>{error}</p>
            <Link to="/">Back to Home</Link>
        </div>
    );
    if (!pdfData) return <div className="pdf-view-error">PDF not found</div>;

    return (
        <div className="book-layout">
            <div className="book-info">
                <Link to="/" className="back-button">← Back to List</Link>
                <div className="book-details">
                    <h1>{pdfData.title}</h1>
                    {pdfData.author && <p className="author">By {pdfData.author}</p>}

                    <div className="page-navigation">
                        <input
                            type="number"
                            name="page"
                            min="1"
                            placeholder="Page #"
                            className="page-input"
                            onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                        />
                    </div>

                    <div className="search-container">
                        <div className="selection-container">
                            {
                                selectedText.map((text, index) => {
                                    return (
                                        <div className="selection" key={index}>
                                            <p key={index} className="selected-text" onClick={() => {
                                                setSelectedText(prevSelected => 
                                                    prevSelected.filter((_, i) => i !== index)
                                                );
                                            }}>
                                                    "{text.substring(0, 50)}
                                                    {text.length > 50 ? '...' : ''}"
                                            </p>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>

                    <ChatPanel 
                        selectedText={selectedText}
                        setSelectedText={setSelectedText}
                        setAnnotations={setAnnotations}
                        title={title}
                    />

                    <div className="book-metadata">
                        <p>Filename: {pdfData.filename}</p>
                    </div>
                </div>
            </div>

            <BookContent 
                text={pdfData.text_content}
                annotations={annotations}
                handleTextSelection={handleTextSelection}
                currentPage={currentPage}
            />
        </div>
    );
}

export default PDFView; 