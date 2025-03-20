import React, { useState, useEffect, use } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PDFView.css';
import ReactMarkdown from 'react-markdown';

function PDFView() {
    const [pdfData, setPdfData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [askingQuestion, setAskingQuestion] = useState(false);
    const { title } = useParams();
    const [selectedText, setSelectedText] = useState([]);
    const [annotations, setAnnotations] = useState("");

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


    const highlightText = (text) => {
        if (annotations.length === 0) return text;
    
        // Split the text where the annotation appears
        const parts = text.split(annotations);


        return (
            <div>
                {parts[0]}
                <span 
                    id={`annotation`}
                    className="annotation-highlight"
                >
                    {annotations}
                </span>
                {parts[1]}
            </div>
        );
    };

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim() && selectedText.length === 0) return;
        
        setAskingQuestion(true);
        setAnswer('');
        
        try {
            let prompt = "Here is a selection of quotes from this book. Please use them and other context from the book to answer the question at the bottom:";
            prompt += selectedText.join('\n');

            if (question.length > 0) {
                prompt += question;
            } else {
                prompt += "Explain the content and the context of the quotes.";
            }

            const response = await fetch(`/api/askquestion?title=${encodeURIComponent(title)}&question=${encodeURIComponent(prompt)}`);
            const data = await response.json();
            
            if (response.ok) {
                setAnswer(data.answer);
                setAnnotations(data.annotations);
            } else {
                setAnswer('Error: ' + (data.error || 'Failed to get answer'));
            }

            setQuestion("");
            setSelectedText([]);
        } catch (err) {
            setAnswer('Error connecting to server');
        } finally {
            setAskingQuestion(false);
        }
    };

    useEffect(() => {
        const annotation = document.getElementById('annotation');
        console.log(annotation);

        if (annotation) {
            annotation.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [annotations]);


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
                                disabled={askingQuestion || (!question.trim() && selectedText.length === 0)}
                            >
                                {askingQuestion ? 'Asking...' : 'Ask'}
                            </button>
                        </form>
                        {answer && (
                            <div className="answer-container">
                                <h4>Answer:</h4>
                                <ReactMarkdown>
                                    {answer}
                                </ReactMarkdown>
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