import React, { useState, useEffect, useRef } from "react";
import { FaRobot, FaPaperPlane, FaTimes, FaMinus, FaExpand } from "react-icons/fa";
import axios from "axios";
import "../styles/Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL;

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
      const response = await axios.post(API_URL, { userQuery: userMessage });

      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove "typing..."
        { sender: "bot", text: response.data.response || "I didn't understand that.", isHtml: true },
      ]);
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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  

  return (
    <div className={`chatbot-container ${isFullScreen ? "full-screen" : ""}`}>
      {isOpen && (
        <div className="chatbox">
          {/* Chat Header */}
          <div className="chatbox-header">
            <h3>Chatbot</h3>
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
                  {msg.sender === "bot" && msg.text === "typing..." ? (
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
              { text: "💹 Exchange Rate", query: "What’s the exchange rate?" },
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
