// src/middlewares/role.middleware.js
// xác thực quyền admin và giáo vụ mới có thể truy cập
export const authorizeRoles = (...allowedRoleIds) => {
  return (req, res, next) => {
    // 1. Kiểm tra xem thông tin user có tồn tại (đã qua lớp authenticate chưa)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập hoặc phiên làm việc hết hạn"
      });
    }

    // 2. Kiểm tra role_id của user có nằm trong danh sách được phép không
    // Ví dụ: allowedRoleIds sẽ là [1, 3]
    const userRoleId = req.user.roleId; 

    if (!allowedRoleIds.includes(userRoleId)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện hành động này"
      });
    }

    // 3. Nếu hợp lệ thì cho đi tiếp
    next();
  };
};

//xác thực quyền chỉ có admin mới có thể truy cập
// src/middlewares/role.middleware.js

// src/middlewares/rolesMiddleware.js

export const isAdmin = (id = 1) => {
  return (req, res, next) => {
    // 1. Kiểm tra đăng nhập
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập!"
      });
    }

    // 2. So sánh ID truyền vào với ID của người dùng
    if (req.user.roleId !== id) {
      return res.status(403).json({
        success: false,
        message: "Bạn không phải Admin, không được vào đây!"
      });
    }

    next();
  };
};