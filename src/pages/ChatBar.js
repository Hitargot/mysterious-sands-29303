import React, { useState } from 'react';

const ChatBar = () => {
  const [messages, setMessages] = useState([
    { sender: "Admin", message: "Hello, welcome to the Admin dashboard!" },
    { sender: "User", message: "I need help with my transaction." },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage) {
      setMessages([...messages, { sender: "Admin", message: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-bar">
      <div className="chat-header">
        <h3>Admin Chat</h3>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === 'Admin' ? 'admin' : 'user'}`}>
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBar;
