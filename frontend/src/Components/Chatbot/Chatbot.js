import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Chatbot.css";

function Chatbot() {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm the KalaaLink assistant. Ask me about artists, events, the marketplace, donations, or contact info." }
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [showWelcomeTip, setShowWelcomeTip] = useState(false);
  const autoHideTimerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Show welcome tip on initial mount for the current page load only
  useEffect(() => {
    setShowWelcomeTip(true);
    autoHideTimerRef.current = setTimeout(() => {
      setShowWelcomeTip(false);
    }, 4500);
    return () => {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current);
    };
  }, []);

  const toggleOpen = () => setIsOpen(prev => !prev);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const nextUserMessage = { role: "user", text: trimmed };
    setMessages(prev => [...prev, nextUserMessage]);
    setInput("");
    setIsSending(true);

    try {
      const res = await axios.post(`${API_BASE}/api/chatbot`, { message: trimmed });
      const reply = res?.data?.reply || "Sorry, I didn’t quite catch that. Could you rephrase?";
      setMessages(prev => [...prev, { role: "bot", text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", text: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="kl-chatbot-root" aria-live="polite">
      {showWelcomeTip && !isOpen && (
        <div className="kl-chatbot-tip" role="status">
          <span className="kl-chatbot-tip-text">👉 Need help? Ask KalaaBot 🎨</span>
          <button
            type="button"
            className="kl-chatbot-tip-close"
            aria-label="Dismiss"
            onClick={() => {
              setShowWelcomeTip(false);
            }}
          >
            ×
          </button>
        </div>
      )}
      {!isOpen && (
        <button className="kl-chatbot-fab" onClick={toggleOpen} aria-label="Open chat">
          💬
        </button>
      )}

      {isOpen && (
        <div className="kl-chatbot-window" role="dialog" aria-modal="false">
          <div className="kl-chatbot-header">
            <div className="kl-chatbot-title">KalaaLink Assistant</div>
            <button className="kl-chatbot-close" onClick={toggleOpen} aria-label="Close chat">×</button>
          </div>
          <div className="kl-chatbot-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`kl-chatbot-message ${m.role}`}>
                <div className="bubble">{m.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="kl-chatbot-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
            />
            <button className="btn btn-primary kl-chatbot-send" onClick={handleSend} disabled={isSending}>
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;


