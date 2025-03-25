import React from 'react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatPanel.css';


function ChatPanel({ 
    selectedText, 
    setSelectedText, 
    setAnnotations,
    title
}) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [askingQuestion, setAskingQuestion] = useState(false);

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

    return (
        <div className="chat-panel">
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