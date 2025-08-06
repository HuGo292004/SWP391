import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google AI with API key from environment or fallback
const API_KEY =
  import.meta.env.VITE_GOOGLE_AI_API_KEY ||
  "AIzaSyDMWBkltFLIslj2SBuVAxZBKaca5Vbgjao";
const genAI = new GoogleGenerativeAI(API_KEY);

// Get the Gemini model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Blood donation related context for the AI
const BLOOD_DONATION_CONTEXT = `
Bạn là một trợ lý AI chuyên về hiến máu và y tế. Bạn có nhiệm vụ:
1. Tư vấn về hiến máu: điều kiện, quy trình, lợi ích
2. Hướng dẫn các bước chuẩn bị trước khi hiến máu
3. Giải đáp thắc mắc về sức khỏe liên quan đến hiến máu
4. Cung cấp thông tin về các nhóm máu và tính tương thích
5. Khuyến khích mọi người tham gia hiến máu nhân đạo

Quy tắc trả lời:
- Luôn trả lời bằng tiếng Việt
- Thông tin chính xác, dựa trên y học hiện đại
- Thân thiện, khuyến khích và tích cực
- Không đưa ra chẩn đoán y khoa cụ thể
- Khuyên tham khảo ý kiến bác sĩ khi cần thiết
- Tối đa 200 từ mỗi câu trả lời

Kiến thức về hiến máu:
- Điều kiện: 18-60 tuổi, cân nặng >45kg, sức khỏe tốt
- Quy trình: khám sơ bộ, lấy máu, nghỉ ngơi
- Lợi ích: giúp đỡ người khác, kiểm tra sức khỏe miễn phí
- Khoảng cách giữa các lần hiến: 12 tuần (84 ngày)
- Nhóm máu: A, B, AB, O với Rh+ và Rh-
`;

class AIChatService {
  constructor() {
    this.chatHistory = [];
  }

  // Send message to AI and get response
  async sendMessage(userMessage) {
    try {
      // Add context about blood donation to the conversation
      const contextualMessage = `${BLOOD_DONATION_CONTEXT}\n\nCâu hỏi của người dùng: ${userMessage}`;

      // Start chat session with history
      const chat = model.startChat({
        history: this.chatHistory,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      // Send message and get response
      const result = await chat.sendMessage(contextualMessage);
      const response = await result.response;
      const text = response.text();

      // Update chat history
      this.chatHistory.push(
        { role: "user", parts: [{ text: userMessage }] },
        { role: "model", parts: [{ text: text }] }
      );

      // Keep only last 10 exchanges to prevent context from getting too long
      if (this.chatHistory.length > 20) {
        this.chatHistory = this.chatHistory.slice(-20);
      }

      return {
        success: true,
        message: text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("AI Chat Error:", error);
      return {
        success: false,
        message: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.",
        error: error.message,
      };
    }
  }

  // Clear chat history
  clearHistory() {
    this.chatHistory = [];
  }

  // Get chat history
  getHistory() {
    return this.chatHistory;
  }

  // Get suggested questions
  getSuggestedQuestions() {
    return [
      "Tôi có đủ điều kiện để hiến máu không?",
      "Cần chuẩn bị gì trước khi hiến máu?",
      "Hiến máu có an toàn không?",
      "Sau bao lâu tôi có thể hiến máu lại?",
      "Nhóm máu O có đặc biệt gì không?",
      "Ai không nên hiến máu?",
      "Quy trình hiến máu diễn ra thế nào?",
      "Hiến máu có những lợi ích gì?",
      "Sau hiến máu cần chú ý điều gì?",
      "Hiến máu có ảnh hưởng đến sức khỏe không?",
    ];
  }
}

// Export singleton instance
export default new AIChatService();
