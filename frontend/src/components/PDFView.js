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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { title } = useParams();

    useEffect(() => {
        fetchPDFData();
    }, [title]);

    // Search functionality
    useEffect(() => {
        if (searchTerm && pdfData) {
            const results = [];
            pdfData.sections.forEach((section, sectionIndex) => {
                const regex = new RegExp(searchTerm, 'gi');

                let index = 1;
                let match;
                while ((match = regex.exec(section.content)) !== null) {
                    results.push({
                        sectionIndex,
                        index: index,
                        text: match[0]
                    });
                    index++;
                }
            })

            console.log(results);

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

        let oldResult = currentResult;
        setCurrentResult(newIndex);

        // Unhilight previouse index
        document.getElementById(searchResults[oldResult].sectionIndex + ":" + searchResults[oldResult].index).classList.remove('current-highlight');   
        const element = document.getElementById(searchResults[newIndex].sectionIndex + ":" + searchResults[newIndex].index)
        element.classList.add('current-highlight');
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Highlight search results in text
    const highlightText = (text, sectionIndex) => {
        if (!searchTerm) return text;

        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
        
        let index = 0;

        return parts.map((part, i) => {
            if (part.toLowerCase() === searchTerm.toLowerCase()) {
                const isCurrentResult = searchResults[currentResult]?.sectionIndex === sectionIndex &&
                    text.indexOf(part) === searchResults[currentResult]?.position;

                ++index;
                return (
                    <span 
                        key={i} 
                        id={sectionIndex + ":" + index}
                        className={`highlight ${isCurrentResult ? 'current-highlight' : ''}`}
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

    const handlePageChange = (event) => {
        const page = parseInt(event.target.value);
        if (page && page > 0 && page <= totalPages) {
            setCurrentPage(page);
            // Find the section that contains this page
            const section = pdfData.sections.find(
                section => section.start_page <= page && section.end_page >= page
            );
            if (section) {
                const element = document.getElementById(`section-${section.start_page}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    useEffect(() => {
        if (pdfData && pdfData.sections.length > 0) {
            const maxPage = Math.max(...pdfData.sections.map(s => s.end_page));
            setTotalPages(maxPage);
        }
    }, [pdfData]);

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
            {/* Left sidebar with book info */}
            <div className="book-info">
                <Link to="/" className="back-button">← Back to List</Link>
                <div className="book-details">
                    <h1>{pdfData.title}</h1>
                    {pdfData.author && <p className="author">By {pdfData.author}</p>}
                    
                    {/* Replace the existing page-navigation div with this simplified version */}
                    <div className="page-navigation">
                        <div className="page-selector">
                            <label htmlFor="page-input">Go to page:</label>
                            <div className="page-input-container">
                                <input
                                    id="page-input"
                                    type="number"
                                    min="1"
                                    max={totalPages}
                                    value={currentPage}
                                    onChange={handlePageChange}
                                    className="page-input"
                                />
                                <span className="page-count">of {totalPages}</span>
                            </div>
                        </div>
                    </div>

                    {/* Search controls */}
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
                            className="book-section"
                        >
                            {highlightText(section.content, index)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PDFView; 