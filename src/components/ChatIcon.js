import React from 'react';
import { Link } from 'react-router-dom';

const ChatIcon = ({ style }) => {
  return (
    <div style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 1000, ...style }}>
      <Link to="/chat-bot">
        <button style={{ background: '#0066ff', color: '#fff', borderRadius: 28, width: 56, height: 56, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', cursor: 'pointer' }} title="Chat with support">
          💬
        </button>
      </Link>
    </div>
  );
};

export default ChatIcon;
