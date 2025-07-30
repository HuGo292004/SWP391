import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  Input,
  Button,
  Space,
  Spin,
  Typography,
  Card,
  Tag,
  Avatar,
  Divider,
  Tooltip,
} from "antd";
import {
  MessageOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  ClearOutlined,
  QuestionCircleOutlined,
  HeartOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import aiChatService from "../../services/aiChatService";
import "./AIChatbot.css";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const AIChatbot = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Kiểm tra trạng thái đăng nhập từ localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra authentication khi component mount và khi localStorage thay đổi
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("userToken");
      const username = localStorage.getItem("username");
      const role = localStorage.getItem("userRole");

      // Chỉ hiển thị chat khi user đã đăng nhập (có đủ token, username và role)
      setIsAuthenticated(!!(token && username && role));
    };

    checkAuth();

    // Lắng nghe thay đổi trong localStorage (khi user đăng nhập/đăng xuất)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isVisible && messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          type: "ai",
          content: `🤖 **Chào mừng bạn đến với Trợ lý AI Hiến máu!** 

✨ **Tôi có thể hỗ trợ bạn:**
🩸 Tư vấn điều kiện và quy trình hiến máu
🏥 Hướng dẫn chuẩn bị trước khi hiến máu  
💊 Giải đáp về sức khỏe và dinh dưỡng
🔬 Thông tin chi tiết về các nhóm máu
❤️ Lợi ích tuyệt vời của việc hiến máu
📋 Hướng dẫn đăng ký và thủ tục

💬 **Hãy bắt đầu cuộc trò chuyện bằng cách gõ câu hỏi hoặc chọn một trong các gợi ý bên dưới!**

*💡 Lưu ý: Thông tin chỉ mang tính tham khảo, hãy tham khảo ý kiến bác sĩ khi cần thiết.*`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [isVisible]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await aiChatService.sendMessage(userMessage.content);

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: response.message,
        timestamp: response.timestamp,
        success: response.success,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
        timestamp: new Date().toISOString(),
        success: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  // Clear chat
  const handleClearChat = () => {
    setMessages([]);
    aiChatService.clearHistory();
    setShowSuggestions(true);
    // Re-add welcome message
    setTimeout(() => {
      setMessages([
        {
          id: Date.now(),
          type: "ai",
          content: `🤖 **Chào mừng bạn đến với Trợ lý AI Hiến máu!** 

✨ **Tôi có thể hỗ trợ bạn:**
🩸 Tư vấn điều kiện và quy trình hiến máu
🏥 Hướng dẫn chuẩn bị trước khi hiến máu  
💊 Giải đáp về sức khỏe và dinh dưỡng
🔬 Thông tin chi tiết về các nhóm máu
❤️ Lợi ích tuyệt vời của việc hiến máu
📋 Hướng dẫn đăng ký và thủ tục

💬 **Hãy bắt đầu cuộc trò chuyện bằng cách gõ câu hỏi hoặc chọn một trong các gợi ý bên dưới!**

*💡 Lưu ý: Thông tin chỉ mang tính tham khảo, hãy tham khảo ý kiến bác sĩ khi cần thiết.*`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }, 100);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get suggested questions
  const suggestedQuestions = aiChatService.getSuggestedQuestions();

  // Không hiển thị gì nếu user chưa đăng nhập
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Chat Button */}
      {!isVisible && (
        <div className="ai-chat-button" onClick={() => setIsVisible(true)}>
          <Tooltip title="Tư vấn hiến máu với AI" placement="left">
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<MessageOutlined />}
              className="chat-toggle-btn"
            />
          </Tooltip>
        </div>
      )}

      {/* Chat Window */}
      {isVisible && (
        <div className={`ai-chat-container ${isMinimized ? "minimized" : ""}`}>
          <div className="ai-chat-card">
            {/* Header */}
            <div className="ai-chat-header">
              <div className="header-info">
                <Avatar icon={<RobotOutlined />} className="ai-avatar" />
                <div className="header-text">
                  <Text strong className="ai-name">
                    🤖 Trợ lý AI Hiến máu
                  </Text>
                  <Text type="secondary" className="ai-status">
                    <span className="status-dot"></span>
                    Sẵn sàng tư vấn 24/7
                  </Text>
                </div>
              </div>
              <div className="header-actions">
                <Button
                  type="text"
                  icon={<ClearOutlined />}
                  onClick={handleClearChat}
                  className="header-btn"
                  title="Xóa cuộc trò chuyện"
                />
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => setIsVisible(false)}
                  className="header-btn"
                  title="Đóng chat"
                />
              </div>
            </div>

            {/* Messages */}
            <div className="ai-chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${
                    message.type === "user" ? "user-message" : "ai-message"
                  }`}
                >
                  <div className="message-avatar">
                    {message.type === "user" ? (
                      <Avatar icon={<UserOutlined />} size="small" />
                    ) : (
                      <Avatar
                        icon={<RobotOutlined />}
                        size="small"
                        className="ai-avatar-small"
                      />
                    )}
                  </div>
                  <div className="message-content">
                    <div className={`message-bubble ${message.type}`}>
                      <Paragraph className="message-text">
                        {message.content}
                      </Paragraph>
                    </div>
                    <Text type="secondary" className="message-time">
                      {formatTime(message.timestamp)}
                    </Text>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="message ai-message">
                  <div className="message-avatar">
                    <Avatar
                      icon={<RobotOutlined />}
                      size="small"
                      className="ai-avatar-small"
                    />
                  </div>
                  <div className="message-content">
                    <div className="message-bubble ai loading">
                      <Spin size="small" />
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        Đang trả lời...
                      </Text>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {showSuggestions && messages.length <= 1 && (
              <div className="ai-chat-suggestions">
                <Text type="secondary" className="suggestions-title">
                  <QuestionCircleOutlined style={{ marginRight: 8 }} />
                  💡 Gợi ý câu hỏi về hiến máu:
                </Text>
                <div className="suggestions-list">
                  {suggestedQuestions.slice(0, 4).map((question, index) => (
                    <Tag
                      key={index}
                      className="suggestion-tag"
                      onClick={() => handleSuggestionClick(question)}
                    >
                      💬 {question}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="ai-chat-input">
              <div className="input-container">
                <TextArea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="💬 Hỏi tôi về hiến máu, sức khỏe, quy trình, điều kiện..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  className="chat-input"
                  disabled={isLoading}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="send-btn"
                />
              </div>
              <Text type="secondary" className="input-hint">
                <HeartOutlined style={{ color: "#e53e3e" }} />
                Tôi sẽ tư vấn hiến máu chính xác và hữu ích nhất cho bạn! 💪❤️
              </Text>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
