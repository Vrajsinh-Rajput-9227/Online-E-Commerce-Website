import { useState, useEffect } from 'react';
import { CiMail, CiUser, CiClock1, CiSearch, CiTrash, CiReply, CiPaperplane } from "react-icons/ci";
import './AdminMessages.css';

function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockMessages = [
      {
        id: 1,
        from: 'john.doe@email.com',
        subject: 'Order #12345 - Shipping Inquiry',
        message: 'Hi, I wanted to check the status of my order. The tracking number shows it hasn\'t moved in 3 days.',
        timestamp: '2024-01-10T10:30:00',
        read: false,
        priority: 'high'
      },
      {
        id: 2,
        from: 'sarah.smith@email.com',
        subject: 'Product Return Request',
        message: 'I received the wrong item and would like to process a return. The order was placed last week.',
        timestamp: '2024-01-10T09:15:00',
        read: true,
        priority: 'medium'
      },
      {
        id: 3,
        from: 'mike.wilson@email.com',
        subject: 'Account Access Issue',
        message: 'I\'m having trouble logging into my account. The password reset link isn\'t working.',
        timestamp: '2024-01-09T16:45:00',
        read: true,
        priority: 'high'
      },
      {
        id: 4,
        from: 'emma.jones@email.com',
        subject: 'Product Question',
        message: 'Is the laptop model XYZ compatible with Windows 11? I need to know before purchasing.',
        timestamp: '2024-01-09T14:20:00',
        read: false,
        priority: 'low'
      }
    ];
    setMessages(mockMessages);
  }, []);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !message.read) ||
                         (filter === 'read' && message.read) ||
                         (filter === 'high' && message.priority === 'high');
    
    return matchesSearch && matchesFilter;
  });

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setMessages(prev => prev.map(msg => 
      msg.id === message.id ? { ...msg, read: true } : msg
    ));
  };

  const handleReply = () => {
    if (replyText.trim() && selectedMessage) {
      // Mock reply functionality - replace with actual API call
      alert(`Reply sent to ${selectedMessage.from}: ${replyText}`);
      setReplyText('');
    }
  };

  const handleCompose = () => {
    if (composeData.to && composeData.subject && composeData.message) {
      // Mock compose functionality - replace with actual API call
      alert(`Message sent to ${composeData.to}`);
      setComposeData({ to: '', subject: '', message: '' });
      setShowCompose(false);
    }
  };

  const handleDelete = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="admin-messages">
      <div className="messages-header">
        <h1>Messages</h1>
        <button 
          className="compose-btn"
          onClick={() => setShowCompose(true)}
        >
          <CiPaperplane size={18} />
          Compose
        </button>
      </div>

      <div className="messages-container">
        {/* Messages List */}
        <div className="messages-list">
          <div className="messages-controls">
            <div className="search-container">
              <CiSearch size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({messages.length})
              </button>
              <button 
                className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread ({messages.filter(m => !m.read).length})
              </button>
              <button 
                className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
                onClick={() => setFilter('high')}
              >
                High Priority
              </button>
            </div>
          </div>

          <div className="messages-list-content">
            {filteredMessages.length === 0 ? (
              <div className="no-messages">
                <CiMail size={48} />
                <p>No messages found</p>
              </div>
            ) : (
              filteredMessages.map(message => (
                <div
                  key={message.id}
                  className={`message-item ${selectedMessage?.id === message.id ? 'selected' : ''} ${!message.read ? 'unread' : ''}`}
                  onClick={() => handleSelectMessage(message)}
                >
                  <div className="message-header">
                    <div className="message-from">
                      <CiUser size={16} />
                      <span>{message.from}</span>
                    </div>
                    <div className="message-meta">
                      {message.priority === 'high' && <span className="priority-badge high">High</span>}
                      <span className="message-time">{formatDate(message.timestamp)}</span>
                    </div>
                  </div>
                  <div className="message-subject">{message.subject}</div>
                  <div className="message-preview">{message.message.substring(0, 100)}...</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="message-detail">
          {selectedMessage ? (
            <div className="message-content">
              <div className="message-detail-header">
                <div className="message-detail-from">
                  <h3>{selectedMessage.subject}</h3>
                  <div className="message-info">
                    <span className="from-info">
                      <CiUser size={16} />
                      {selectedMessage.from}
                    </span>
                    <span className="time-info">
                      <CiClock1 size={16} />
                      {new Date(selectedMessage.timestamp).toLocaleString()}
                    </span>
                    {selectedMessage.priority === 'high' && (
                      <span className="priority-badge high">High Priority</span>
                    )}
                  </div>
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(selectedMessage.id)}
                >
                  <CiTrash size={18} />
                </button>
              </div>
              
              <div className="message-body">
                {selectedMessage.message}
              </div>

              <div className="message-reply">
                <h4>Reply</h4>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="reply-textarea"
                  rows="4"
                />
                <button 
                  className="send-reply-btn"
                  onClick={handleReply}
                >
                  <CiPaperplane size={16} />
                  Send Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="no-message-selected">
              <CiMail size={64} />
              <p>Select a message to view</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="compose-modal">
          <div className="compose-content">
            <div className="compose-header">
              <h3>Compose Message</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCompose(false)}
              >
                ×
              </button>
            </div>
            
            <div className="compose-form">
              <input
                type="email"
                placeholder="To"
                value={composeData.to}
                onChange={(e) => setComposeData({...composeData, to: e.target.value})}
                className="compose-input"
              />
              <input
                type="text"
                placeholder="Subject"
                value={composeData.subject}
                onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                className="compose-input"
              />
              <textarea
                placeholder="Message"
                value={composeData.message}
                onChange={(e) => setComposeData({...composeData, message: e.target.value})}
                className="compose-textarea"
                rows="8"
              />
              <div className="compose-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowCompose(false)}
                >
                  Cancel
                </button>
                <button 
                  className="send-btn"
                  onClick={handleCompose}
                >
                  <CiPaperplane size={16} />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMessages;
