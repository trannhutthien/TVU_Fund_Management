import ThongBaoModel from "../../models/common/ThongBaoModel.js";

// GET /api/thong-bao — Lay thong bao cua nguoi dung hien tai
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const notifications = await ThongBaoModel.getByUserId(userId, limit);
    const unreadCount = await ThongBaoModel.getUnreadCount(userId);

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    console.error("Loi getMyNotifications:", error);
    return res.status(500).json({
      success: false,
      message: "Loi server, vui long thu lai sau"
    });
  }
};

// GET /api/thong-bao/unread-count — Dem thong bao chua doc
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await ThongBaoModel.getUnreadCount(userId);
    return res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error("Loi getUnreadCount:", error);
    return res.status(500).json({
      success: false,
      message: "Loi server, vui long thu lai sau"
    });
  }
};

// PUT /api/thong-bao/:id/doc — Danh dau da doc
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const success = await ThongBaoModel.markAsRead(parseInt(id), userId);
    return res.status(200).json({
      success: true,
      data: { marked: success }
    });
  } catch (error) {
    console.error("Loi markAsRead:", error);
    return res.status(500).json({
      success: false,
      message: "Loi server, vui long thu lai sau"
    });
  }
};

// PUT /api/thong-bao/doc-tat-ca — Danh dau tat ca da doc
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await ThongBaoModel.markAllAsRead(userId);
    return res.status(200).json({
      success: true,
      data: { markedCount: count }
    });
  } catch (error) {
    console.error("Loi markAllAsRead:", error);
    return res.status(500).json({
      success: false,
      message: "Loi server, vui long thu lai sau"
    });
  }
};
