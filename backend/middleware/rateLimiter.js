const ipRequests = new Map();

// Dọn dẹp bộ nhớ định kỳ mỗi 5 phút để tránh rò rỉ bộ nhớ
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequests.entries()) {
    if (now > data.resetTime) {
      ipRequests.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Middleware Rate Limiter lưu trong bộ nhớ (In-Memory)
 * 
 * @param {Object} options
 * @param {number} options.windowMs - Khoảng thời gian theo dõi (ms)
 * @param {number} options.max - Số lượng yêu cầu tối đa trong khoảng windowMs
 * @param {string} options.message - Thông điệp trả về khi bị chặn
 */
export const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 60 * 60 * 1000; // Mặc định: 1 giờ
  const max = options.max || 3; // Mặc định: 3 lần
  const message = options.message || "Bạn đã gửi quá nhiều yêu cầu.";

  return (req, res, next) => {
    // Lấy địa chỉ IP của client (xử lý khi chạy qua proxy/load balancer)
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const now = Date.now();

    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    const data = ipRequests.get(ip);

    // Nếu khoảng thời gian cũ đã qua, reset lại
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return next();
    }

    // Nếu vượt quá số lần cho phép
    if (data.count >= max) {
      const minutesLeft = Math.ceil((data.resetTime - now) / (60 * 1000));
      return res.status(429).json({
        success: false,
        message: `${message} Vui lòng thử lại sau ${minutesLeft} phút.`,
      });
    }

    data.count += 1;
    next();
  };
};
