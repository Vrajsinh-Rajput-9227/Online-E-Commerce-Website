import React, { useState } from 'react';
import { FaComments, FaTimes, FaSmile, FaPaperclip } from 'react-icons/fa';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! Welcome to TechShed. How can I help you today?' }
  ]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { type: 'user', text: message }]);
      setMessage('');
      
      // Simulate bot response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: 'Thank you for your message! Our team will get back to you soon.' 
        }]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-widget">
      {/* Chat Icon */}
      <div 
        className={`chat-icon ${isOpen ? 'hidden' : ''}`}
        onClick={toggleChat}
      >
        <FaComments />
      </div>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="header-content">
            <h4>TechShop</h4>
            <p>We'll reply as soon as we can</p>
          </div>
          <button className="close-btn" onClick={toggleChat}>
            <FaTimes />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="chat-input">
          <div className="input-container">
            <button className="emoji-btn">
              <FaSmile />
            </button>
            <button className="attachment-btn">
              <FaPaperclip />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="message-input"
            />
            <button onClick={sendMessage} className="send-btn">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
