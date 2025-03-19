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
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [askingQuestion, setAskingQuestion] = useState(false);
    const { title } = useParams();
    const [selectedText, setSelectedText] = useState('');

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

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;
        
        setAskingQuestion(true);
        setAnswer('');
        
        try {
            const response = await fetch(`/api/askquestion?title=${encodeURIComponent(title)}&question=${encodeURIComponent(question)}`);
            const data = await response.json();
            
            if (response.ok) {
                setAnswer(data.answer);
            } else {
                setAnswer('Error: ' + (data.error || 'Failed to get answer'));
            }
        } catch (err) {
            setAnswer('Error connecting to server');
        } finally {
            setAskingQuestion(false);
        }
    };

    const handleExplainSelection = async () => {
        if (!selectedText) return;
        
        setAskingQuestion(true);
        setAnswer('');
        const questionText = `Explain this text: "${selectedText}"`;
        setQuestion(questionText);
        
        try {
            const response = await fetch(`/api/askquestion?title=${encodeURIComponent(title)}&question=${encodeURIComponent(questionText)}`);
            const data = await response.json();
            
            if (response.ok) {
                setAnswer(data.answer);
            } else {
                setAnswer('Error: ' + (data.error || 'Failed to get answer'));
            }
        } catch (err) {
            setAnswer('Error connecting to server');
        } finally {
            setAskingQuestion(false);
        }
    };

    const handleTextSelection = () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        if (text) {
            setSelectedText(text);
        }
    };

    const addToSearch = () => {
        if (selectedText) {
            setSearchTerm(prevTerm => {
                const newTerm = prevTerm ? `${prevTerm} ${selectedText}` : selectedText;
                setSelectedText(''); // Clear selection after adding
                return newTerm;
            });
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
                        {selectedText && (
                            <div className="selection-actions">
                                <span className="selected-text">
                                    "{selectedText.substring(0, 50)}
                                    {selectedText.length > 50 ? '...' : ''}"
                                </span>
                                <button 
                                    onClick={handleExplainSelection}
                                    className="explain-button"
                                    disabled={askingQuestion}
                                >
                                    {askingQuestion ? 'Explaining...' : 'Explain'}
                                </button>
                                <button 
                                    onClick={() => setSelectedText('')}
                                    className="clear-selection"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                        {searchResults.length > 0 && (
                            <div className="search-navigation">
                                <button onClick={() => navigateResults('prev')}>↑</button>
                                <span>{currentResult + 1} of {searchResults.length}</span>
                                <button onClick={() => navigateResults('next')}>↓</button>
                            </div>
                        )}
                    </div>

                    <div className="question-container">
                        <form onSubmit={handleQuestionSubmit}>
                            <input
                                type="text"
                                placeholder="Ask a question about the book..."
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                className="question-input"
                            />
                            <button 
                                type="submit" 
                                className="question-submit"
                                disabled={askingQuestion || !question.trim()}
                            >
                                {askingQuestion ? 'Asking...' : 'Ask'}
                            </button>
                        </form>
                        {answer && (
                            <div className="answer-container">
                                <h4>Answer:</h4>
                                <p>{answer}</p>
                            </div>
                        )}
                    </div>

                    <div className="book-metadata">
                        <p>Filename: {pdfData.filename}</p>
                    </div>
                </div>
            </div>

            {/* Right side with scrollable book content */}
            <div className="book-content">
                <div className="book-text">
                    <div 
                        className="text-content"
                        onMouseUp={handleTextSelection}
                    >
                        {highlightText(pdfData.text_content)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PDFView; 