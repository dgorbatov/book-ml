import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatPanel.css';

function ChatPanel({ 
    selectedText, 
    setSelectedText, 
    question, 
    setQuestion, 
    answer, 
    askingQuestion, 
    handleQuestionSubmit 
}) {
    return (
        <div className="chat-panel">
            <div className="selection-container">
                {selectedText.map((text, index) => (
                    <div className="selection" key={index}>
                        <p 
                            className="selected-text" 
                            onClick={() => {
                                setSelectedText(prevSelected => 
                                    prevSelected.filter((_, i) => i !== index)
                                );
                            }}
                        >
                            "{text.substring(0, 50)}
                            {text.length > 50 ? '...' : ''}"
                        </p>
                    </div>
                ))}
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
        </div>
    );
}

export default ChatPanel; 