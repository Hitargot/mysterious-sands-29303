import React, { useState, useEffect, useRef } from "react";
import { FaRobot, FaPaperPlane, FaTimes, FaMinus, FaExpand } from "react-icons/fa";
import axios from "axios";
import { io as ioClient } from 'socket.io-client';
import "../styles/Chatbot.css";
import { useLocation } from 'react-router-dom';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const location = useLocation();

  const API_URL = process.env.REACT_APP_API_URL;
  const BOT_API = API_URL ? `${API_URL}/api/chatbot` : '/api/chatbot';
  const HISTORY_API = API_URL ? `${API_URL}/api/chat/history` : '/api/chat/history';
  const jwt = localStorage.getItem('jwtToken');
  const userId = localStorage.getItem('userId');
  const SOCKET_URL = process.env.REACT_APP_API_URL || '';
  const [socket, setSocket] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);

  const toggleChat = () => setIsOpen(!isOpen);
  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  const sendMessage = async (query) => {
    if (loading) return;
    const userMessage = query || input.trim();
    if (!userMessage) return;

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { sender: "bot", text: "typing..." }]);

    try {
      const opts = {};
      if (jwt) opts.headers = { Authorization: `Bearer ${jwt}` };
      // by default start a new thread unless user indicates they want to continue an existing chat
      const payload = { userQuery: userMessage };
      if (activeChatId) payload.chatId = activeChatId; else payload.newThread = true;
      const response = await axios.post(BOT_API, payload, opts);

      const botReply = response.data.response || "I didn't understand that.";
      console.log('[Web Chat] API response', response.data);
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove "typing..."
        { sender: "bot", text: botReply, isHtml: true },
      ]);

      // If server indicates a follow-up greeting, show a simple Yes/No prompt
      if (response.data && response.data.followUp) {
        // If user already in active chat with agent, don't show follow-up prompt
        if (activeChatId) {
          setMessages((prev) => [
            { sender: 'bot', text: botReply },
            ...prev,
          ]);
        } else {
          setMessages((prev) => [
            { sender: 'system', text: botReply, type: 'agent_prompt', originalQuery: userMessage },
            ...prev,
          ]);
        }
        return;
      }

      // Fallback: detect escalation suggestion text even if backend didn't set needsAgent
      const escalationTextPresent = typeof botReply === 'string' && /would you like to talk to (a |an )?human agent|would you like to talk to an agent|talk to a human/i.test(botReply);
      if (response.data && (response.data.needsAgent || escalationTextPresent) && !activeChatId) {
        // insert an inline system prompt for the user to choose Yes/No
        setMessages((prev) => [
          { sender: 'system', text: 'Would you like to talk to a human agent?', type: 'agent_prompt', originalQuery: userMessage },
          ...prev,
        ]);
      }
      // if server returned a chat (created for agent request) save it for explicit continuation
      if (response.data && response.data.chat && response.data.chat._id) {
        try { localStorage.setItem('lastChatId', response.data.chat._id); } catch (e) {}
        setActiveChatId(response.data.chat._id);
      }
    } catch (error) {
      console.error("Chatbot API Error:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove "typing..."
        { sender: "bot", text: "⚠️ Error connecting to chatbot." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Request a human agent (web version)
  const requestAgentWeb = async (userQuery) => {
    const opts = { headers: {} };
    if (jwt) opts.headers.Authorization = `Bearer ${jwt}`;
    try {
      const res = await axios.post(`${BOT_API.replace('/chatbot','')}/chat/request-agent`, { userQuery }, opts);
      console.log('requestAgentWeb response', res.data);
      if (res.data && res.data.chat && res.data.chat._id) {
        try { localStorage.setItem('lastChatId', res.data.chat._id); } catch (e) {}
        setActiveChatId(res.data.chat._id);
      }
      setMessages((prev) => [{ sender: 'bot', text: 'Agent has been notified. You will be contacted shortly.' }, ...prev]);
    } catch (e) {
      console.warn('Failed to request agent (web)', e);
      setMessages((prev) => [{ sender: 'bot', text: 'Failed to notify agent. Please try again later.' }, ...prev]);
    }
  };

  // Clarify helper: show a small inline input prompt for the user to clarify what they need
  const askClarify = (originalQuery) => {
    setMessages((prev) => [
      { sender: 'system', text: 'What would you like help with?', type: 'clarify_prompt', originalQuery },
      ...prev,
    ]);
  };

  const handleClarifySubmit = async (text, originalQuery) => {
    if (!text || !text.trim()) return;
    // send clarification to bot
    try {
      const opts = {};
      if (jwt) opts.headers = { Authorization: `Bearer ${jwt}` };
  const payload = { userQuery: text };
  if (activeChatId) payload.chatId = activeChatId;
  const res = await axios.post(BOT_API, payload, opts);
      const botReply = res.data.response || 'No response';
      setMessages((prev) => [{ sender: 'bot', text: botReply }, ...prev]);
      if (res.data && res.data.chat && res.data.chat._id) {
        try { localStorage.setItem('lastChatId', res.data.chat._id); } catch (e) {}
        setActiveChatId(res.data.chat._id);
      }
      if (res.data && res.data.needsAgent) {
        setMessages((prev) => [{ sender: 'system', text: 'Would you like to talk to a human agent?', type: 'agent_prompt', originalQuery: text }, ...prev]);
      }
    } catch (e) {
      console.warn('Clarify submit failed', e);
    }
  };

  const handlePromptChoiceWeb = async (choice, originalQuery) => {
    if (choice === 'yes') {
      await requestAgentWeb(originalQuery || input);
    } else {
      setMessages((prev) => [{ sender: 'bot', text: 'No problem N/A you can try our FAQs for self-help.' }, ...prev]);
    }
  };

  // fetch chat history for authenticated users and show adminResponse
  const fetchHistory = async () => {
    try {
      const opts = {};
      if (jwt) opts.headers = { Authorization: `Bearer ${jwt}` };
      const res = await axios.get(HISTORY_API, opts);
      const chats = res.data.chats || [];

      // Use threaded messages when available
      const msgs = [];
      chats.slice().reverse().forEach((c) => {
        if (Array.isArray(c.messages) && c.messages.length) {
          c.messages.forEach((m) => {
            msgs.push({ sender: m.from, text: m.text, timestamp: m.timestamp, isHtml: m.from === 'bot' });
          });
        } else {
          // fallback to legacy fields
          if (c.userQuery) msgs.push({ sender: 'user', text: c.userQuery });
          if (c.botResponse) msgs.push({ sender: 'bot', text: c.botResponse, isHtml: true });
          if (c.adminResponse) msgs.push({ sender: 'admin', text: c.adminResponse });
        }
      });

      if (msgs.length === 0) {
        // show a friendly starter message
        setMessages([{ sender: 'bot', text: 'Hello! How can I assist you today?' }]);
      } else {
        setMessages(msgs);
      }
    } catch (err) {
      console.warn('Failed to fetch chat history', err);
      // silently ignore for unauthenticated users
      if (!messages.length) setMessages([{ sender: 'bot', text: 'Hello! How can I assist you today?' }]);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // auto-open when route is /chat-bot and poll history for admin replies
  useEffect(() => {
    if (location && location.pathname === '/chat-bot') setIsOpen(true);
    fetchHistory();
    // load existing active chat id if any
    try {
      const saved = localStorage.getItem('lastChatId');
      if (saved) setActiveChatId(saved);
    } catch (e) {}

    // establish socket connection for realtime updates
    if (window && SOCKET_URL) {
      try {
        const s = ioClient(SOCKET_URL, { transports: ['websocket'] });
        setSocket(s);
        s.on('connect', () => {
          console.log('[socket] connected', s.id);
          // authenticate socket with token and role
          s.emit('authenticate', { token: jwt, role: 'user' });
          // join personal room if we have userId
          if (userId) s.emit('joinRoom', `user_${userId}`);
        });

        s.on('chat:message', (payload) => {
          // payload.chat contains the full chat object; append adminResponse if present
          if (payload && payload.chat && payload.chat.adminResponse) {
            setMessages((prev) => [...prev, { sender: 'admin', text: payload.chat.adminResponse }]);
          }
        });

        // new single-message event: { chatId, message }
        s.on('chat:message:single', (payload) => {
          try {
            console.log('[socket] chat:message:single', payload);
            if (!payload) return;
            const msg = payload.message || (payload.chat && payload.chat.messages && payload.chat.messages.slice(-1)[0]);
            if (!msg) return;
            const sender = msg.from === 'admin' ? 'admin' : (msg.from === 'user' ? 'user' : 'bot');
            setMessages((prev) => [...prev, { sender, text: msg.text || String(msg) }]);

            // persist chat id for explicit continuation
            if (payload.chatId && window && window.localStorage) {
              try { localStorage.setItem('lastChatId', payload.chatId); } catch (e) {}
              setActiveChatId(payload.chatId);
            }
          } catch (e) {
            console.warn('Failed to handle chat:message:single', e);
          }
        });

        s.on('chat:created', (payload) => {
          // when user creates chat we may receive confirmation N/A refresh history
          try {
            if (payload && payload.chat && payload.chat._id && window && window.localStorage) {
              try { localStorage.setItem('lastChatId', payload.chat._id); } catch (e) {}
            }
          } catch (e) {}
          fetchHistory();
        });

        s.on('disconnect', () => console.log('[socket] disconnected'));
      } catch (e) {
        console.warn('Socket connect failed', e);
      }
    }

    const id = setInterval(fetchHistory, 20000);
    return () => {
      clearInterval(id);
      if (socket) socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  

  return (
    <div className={`chatbot-container ${isFullScreen ? "full-screen" : ""}`}>
      {isOpen && (
        <div className="chatbox">
          {/* Chat Header */}
          <div className="chatbox-header">
            <h3>Chatbot {socket && socket.connected ? (<span style={{marginLeft:8, color:'#0b8a3e', fontSize:12}}>● Live</span>) : null}</h3>
            <div className="chatbox-controls">
              <FaExpand onClick={toggleFullScreen} />
              <FaMinus onClick={toggleChat} />
              <FaTimes onClick={() => setIsOpen(false)} />
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <span className="message-icon">
                  {msg.sender === "bot" ? "🤖" : "🧑"}
                </span>
                <span className="message-text">
                  {msg.type === 'agent_prompt' ? (
                      <div className="agent-prompt">
                        <div style={{ marginBottom: 8 }}>{msg.text}</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => { handlePromptChoiceWeb('yes', msg.originalQuery); askClarify(msg.originalQuery); }}>Yes</button>
                          <button onClick={() => handlePromptChoiceWeb('no', msg.originalQuery)}>No</button>
                        </div>
                      </div>
                    ) : msg.type === 'clarify_prompt' ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="text" placeholder="Describe what you need..." onKeyDown={(e) => { if (e.key === 'Enter') { handleClarifySubmit(e.target.value, msg.originalQuery); e.target.value = ''; } }} />
                        <button onClick={() => {/* noop - enter to submit */}}>Send</button>
                      </div>
                    ) : msg.sender === "bot" && msg.text === "typing..." ? (
                    <span className="typing-animation">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  ) : msg.isHtml ? ( // Render HTML messages properly
                    <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                  ) : (
                    msg.text
                  )}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="quick-questions">
            {[
              { text: "💹 Exchange Rate", query: "What's the exchange rate?" },
              { text: "💰 Fund Wallet", query: "How do I fund my wallet?" },
              { text: "🏦 Withdraw Funds", query: "How do I withdraw?" },
            ].map((btn, idx) => (
              <button key={idx} onClick={() => sendMessage(btn.query)} disabled={loading}>
                {btn.text}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="chatbox-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <FaPaperPlane onClick={() => sendMessage()} className={loading ? "disabled" : ""} />
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <button className="chatbot-toggle" onClick={toggleChat}>
        <FaRobot size={24} />
      </button>
    </div>
  );
};

export default Chatbot;
