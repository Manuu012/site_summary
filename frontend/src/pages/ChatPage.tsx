import React, { useState, useEffect } from 'react';
import { crawlerAPI } from '../apis/api';
import { useAIChat } from '../hooks/useAIChat';
import '../styles/chat.css';
import CustomDropdown from '../components/CustomDropdown';

export interface Website {
  id: number;
  url: string;
  title: string;
  content: string;
}

interface ChatMessage {
  id?: number;
  question: string;
  answer: string;
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { sending, sendQuestion } = useAIChat({
    onError: (errorMsg) => setError(errorMsg)
  });

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const response = await crawlerAPI.getWebsites();
        setWebsites(response.data.data || []);
      } catch (err) {
        setError('Failed to load websites');
        console.error('Error fetching websites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsites();
  }, []);

  const handleWebsiteChange = (id: string) => {
    const websiteId = parseInt(id);
    const website = websites.find(w => w.id === websiteId) || null;
    setSelectedWebsite(website);
    setChatMessages([]); // Clear chat when website changes
    setError(''); // Clear any previous errors
  };

  const handleSendQuestion = async () => {
  if (!currentQuestion.trim() || !selectedWebsite) return;

  const question = currentQuestion.trim();
  setError(''); // Clear previous errors

  // Add user question to chat immediately
  const userMessage: ChatMessage = {
    question,
    answer: 'Thinking...', // Placeholder while AI processes
    timestamp: new Date()
  };
  setChatMessages(prev => [...prev, userMessage]);
  setCurrentQuestion('');

  try {
    // Get AI response from backend using website ID
    const aiAnswer = await sendQuestion(question, selectedWebsite.id.toString());


    console.log('AI Answer:', aiAnswer);
    
    // Update the message with real AI response
    setChatMessages(prev => 
      prev.map((msg, index) => 
        index === prev.length - 1 
          ? { ...msg, answer: aiAnswer }
          : msg
      )
    );

  } catch (err) {
    // Error is already handled in the hook, just update the message to show error
    setChatMessages(prev => 
      prev.map((msg, index) => 
        index === prev.length - 1 
          ? { ...msg, answer: 'Sorry, I encountered an error. Please try again.' }
          : msg
      )
    );
  }
};

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendQuestion();
    }
  };

  return (
    <div className="container">
        <header className="chat-header">
          <h1>AI Chat Interface</h1>
          <button 
          className="analytics-button"
          onClick={() => window.location.href = '/site_summary/analytics'}
        >
          📊 View Analytics
        </button>
        </header>

        
        {/* Error Display */}
        {error && (
          <div className="global-error">
            ❌ {error}
          </div>
        )}
        

        <div className="chat-layout">
          {/* Website Selection Section */}
          <div className="website-section">
            <div className="section-card">
              <h3>📚 Select Website</h3>
              
              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  Loading websites...
                </div>
              )}
              
              {!loading && (
                <>
                <div className="website-selection-section">
               <CustomDropdown
               websites={websites}
               selectedWebsite={selectedWebsite}
               onSelect={handleWebsiteChange}
               placeholder="-- Select a website --"
               />
              </div>

                  {selectedWebsite && (
                    <div className="selected-website-info">
                      <h4>Selected Website:</h4>
                      <div className="website-details">
                        <div className="website-title">
                          <strong>Title:</strong> {selectedWebsite.title || 'No Title'}
                        </div>
                        <div className="website-url">
                          <strong>URL:</strong> {selectedWebsite.url}
                        </div>
                        <div className="content-length">
                          <strong>Content:</strong> {selectedWebsite.content.length} characters
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="website-count">
                    {websites.length} website(s) available
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className="chat-section">
            <div className="section-card chat-card">
              <h3>💬 Chat with AI</h3>
              
              {selectedWebsite ? (
                <div className="chat-active">
                  {/* Chat Messages */}
                  <div className="chat-messages">
                    {chatMessages.length === 0 ? (
                      <div className="no-messages">
                        <p>💭 No messages yet</p>
                        <p>Ask a question about "{selectedWebsite.title}" to get started!</p>
                      </div>
                    ) : (
                      <div className="messages-list">
                        {chatMessages.map((message, index) => (
                          <div key={index} className="message">
                            <div className="message-question">
                              <strong>You:</strong> {message.question}
                            </div>
                            <div className="message-answer">
                              <strong>AI:</strong> {message.answer}
                            </div>
                            <div className="message-time">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                        {sending && (
                          <div className="message typing-indicator">
                            <div className="message-answer">
                              <strong>AI:</strong> 
                              <span className="typing-dots">
                                <span>.</span><span>.</span><span>.</span>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="chat-input-container">
                    <div className="input-group">
                      <input
                        type="text"
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Ask a question about ${selectedWebsite.title}...`}
                        disabled={sending}
                        className="question-input"
                      />
                      <button 
                        onClick={handleSendQuestion}
                        disabled={!currentQuestion.trim() || sending}
                        className="send-button"
                      >
                        {sending ? '⏳' : '📤'}
                      </button>
                    </div>
                    <div className="input-hint">
                      Press Enter to send • Shift+Enter for new line
                    </div>
                  </div>
                </div>
              ) : (
                <div className="chat-inactive">
                  <div className="inactive-message">
                    👆 Please select a website from the left to start chatting
                  </div>
                  <p>The AI will answer questions based on the selected website's content.</p>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default ChatPage;