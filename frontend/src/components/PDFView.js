import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PDFView.css';

function PDFView() {
    const [pdfData, setPdfData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentResult, setCurrentResult] = useState(-1);
    const { title } = useParams();

    useEffect(() => {
        fetchPDFData();
    }, [title]);

    // Search functionality
    useEffect(() => {
        if (searchTerm && pdfData) {
            const regex = new RegExp(searchTerm, 'gi');
            let results = [];
            let match;
            let index = 1;
            
            while ((match = regex.exec(pdfData.text_content)) !== null) {
                results.push({
                    index: index,
                    text: match[0]
                });
                index++;
            }

            setSearchResults(results);
            setCurrentResult(0);
        } else {
            setSearchResults([]);
            setCurrentResult(-1);
        }
    }, [searchTerm, pdfData]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const navigateResults = (direction) => {
        if (searchResults.length === 0) return;
        
        let newIndex;
        if (direction === 'next') {
            newIndex = currentResult + 1 >= searchResults.length ? 0 : currentResult + 1;
        } else {
            newIndex = currentResult - 1 < 0 ? searchResults.length - 1 : currentResult - 1;
        }

        setCurrentResult(newIndex);
    };

    const highlightText = (text) => {
        if (!searchTerm) return text;

        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
        let index = 0;

        return parts.map((part, i) => {
            if (part.toLowerCase() === searchTerm.toLowerCase()) {
                index++;
                return (
                    <span 
                        key={i} 
                        id={index.toString()}
                        className={`highlight ${index === searchResults[currentResult]?.index ? 'current-highlight' : ''}`}
                    >
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    const fetchPDFData = async () => {
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

                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <input
                                type="text"
                                placeholder="Search in book..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="search-input"
                            />
                            {searchTerm && (
                                <button 
                                    className="clear-search"
                                    onClick={() => setSearchTerm('')}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        {searchResults.length > 0 && (
                            <div className="search-navigation">
                                <button onClick={() => navigateResults('prev')}>↑</button>
                                <span>{currentResult + 1} of {searchResults.length}</span>
                                <button onClick={() => navigateResults('next')}>↓</button>
                            </div>
                        )}
                    </div>

                    <div className="book-metadata">
                        <p>Filename: {pdfData.filename}</p>
                        <p>Sections: {pdfData.sections.length}</p>
                    </div>
                </div>
            </div>

            {/* Right side with scrollable book content */}
            <div className="book-content">
                <div className="book-text">
                    {pdfData.sections.map((section, index) => (
                        <div 
                            key={index} 
                            id={`section-${section.start_page}`}
                            className={`book-section ${index === currentResult ? 'section-selected' : ''}`}
                            onMouseEnter={(e) => e.currentTarget.classList.add('section-hover')}
                            onMouseLeave={(e) => e.currentTarget.classList.remove('section-hover')}
                        >
                            {highlightText(section.content)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PDFView; 