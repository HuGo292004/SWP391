// API endpoints for password reset functionality
const BASE_URL = "https://localhost:7157/api";

export const passwordResetAPI = {
  // Gửi email đặt lại mật khẩu
  sendResetEmail: async (email) => {
    try {
      console.log("Sending password reset email to:", email);

      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể gửi email đặt lại mật khẩu");
      }

      return {
        success: true,
        message: "Email đặt lại mật khẩu đã được gửi",
        data,
      };
    } catch (error) {
      console.error("Send reset email error:", error);
      return {
        success: false,
        message: error.message || "Có lỗi xảy ra khi gửi email",
        error,
      };
    }
  },

  // Xác thực mã và đặt lại mật khẩu
  resetPassword: async (resetData) => {
    try {
      console.log("Resetting password with data:", resetData);

      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetData.email,
          token: resetData.verificationCode,
          newPassword: resetData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể đặt lại mật khẩu");
      }

      return {
        success: true,
        message: "Mật khẩu đã được đặt lại thành công",
        data,
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: error.message || "Có lỗi xảy ra khi đặt lại mật khẩu",
        error,
      };
    }
  },

  // Xác thực mã reset
  verifyResetCode: async (email, code) => {
    try {
      console.log("Verifying reset code for:", email);

      const response = await fetch(`${BASE_URL}/auth/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Mã xác thực không hợp lệ");
      }

      return {
        success: true,
        message: "Mã xác thực hợp lệ",
        data,
      };
    } catch (error) {
      console.error("Verify reset code error:", error);
      return {
        success: false,
        message: error.message || "Mã xác thực không đúng hoặc đã hết hạn",
        error,
      };
    }
  },
};

export default passwordResetAPI;
