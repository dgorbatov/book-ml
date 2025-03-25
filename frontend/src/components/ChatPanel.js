import React from 'react';
import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatPanel.css';

function ChatPanel({ 
    selectedText, 
    setSelectedText, 
    setAnnotations,
    title
}) {
    const [answer, setAnswer] = useState('');
    const [askingQuestion, setAskingQuestion] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const question = useRef('');

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        const currQuestion = question.current.value;
        if (!currQuestion.trim() && selectedText.length === 0) return;
        
        setAskingQuestion(true);
        setAnswer('');
        
        try {
            let prompt = "Here is a selection of quotes from this book. Please use them and other context from the book to answer the question at the bottom:";
            prompt += selectedText.join('\n');

            if (currQuestion.length > 0) {
                prompt += currQuestion;
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

            question.current.value = '';
            setSelectedText([]);
        } catch (err) {
            setAnswer('Error connecting to server');
        } finally {
            setAskingQuestion(false);
        }
    };

    const ChatInterface = ({ isPopup = false }) => (
        <div className={isPopup ? "chat-popup-content" : "chat-panel"}>
            <div className="selected-quotes">
                {selectedText.map((text, index) => (
                    <div key={index} className="selected-quote">
                        <p>"{text}"</p>
                        <button 
                            onClick={() => setSelectedText(prev => 
                                prev.filter((_, i) => i !== index)
                            )}
                            className="remove-quote"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <div className="chat-messages">
                {answer && (
                    <div className="answer-container">
                        <h4>Answer:</h4>
                        <ReactMarkdown>
                            {answer}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            <form onSubmit={handleQuestionSubmit} className="chat-input-form">
                <input
                    type="text"
                    placeholder="Ask a question about the book..."
                    className="question-input"
                    ref={question}
                />
                <button 
                    type="submit" 
                    className="question-submit"
                    disabled={askingQuestion}
                >
                    {askingQuestion ? 'Asking...' : 'Ask'}
                </button>
            </form>
        </div>
    );

    return (
        <>
            {/* Original interface */}
            <div className="chat-container">
                <ChatInterface />
                <button 
                    className="expand-chat-button"
                    onClick={() => setIsPopupOpen(true)}
                >
                    Expand ↗
                </button>
            </div>

            {/* Popup interface */}
            {isPopupOpen && (
                <div className="chat-popup-overlay">
                    <div className="chat-popup">
                        <div className="chat-popup-header">
                            <h3>Chat</h3>
                            <button 
                                className="close-button"
                                onClick={() => setIsPopupOpen(false)}
                            >
                                ×
                            </button>
                        </div>
                        <ChatInterface isPopup={true} />
                    </div>
                </div>
            )}
        </>
    );
}

export default ChatPanel; 