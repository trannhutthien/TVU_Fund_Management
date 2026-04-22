import jwt from "jsonwebtoken";

// Middleware kiểm tra JWT token — dùng cho các route cần đăng nhập
export const protect = (req, res, next) => {
  try {
    // Lấy token từ header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không có token, vui lòng đăng nhập",
      });
    }

    const token = authHeader.split(" ")[1];

    // Giải mã và xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gán thông tin user vào request để các route sau dùng
    req.user = {
      id: decoded.id,
      vai_tro: decoded.vai_tro,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

// Middleware kiểm tra vai trò (phân quyền)
// Ví dụ dùng: router.get("/...", protect, requireRole("quan_tri"), controller)
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.vai_tro)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện thao tác này",
      });
    }
    next();
  };
};
