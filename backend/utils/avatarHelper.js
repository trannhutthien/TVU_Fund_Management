/**
 * Avatar Helper
 * 
 * Utility functions để xử lý avatar URL
 */

/**
 * Build full avatar URL từ relative path
 * 
 * @param {string} avatarPath - Avatar path từ database
 * @returns {string|null} - Full avatar URL hoặc null
 * 
 * Xử lý các trường hợp:
 * - null/undefined → null
 * - "http://..." hoặc "https://..." → giữ nguyên
 * - "uploads/avatars/vingroup.jpg" → "http://localhost:5001/uploads/avatars/vingroup.jpg"
 * - "/uploads/avatars/vingroup.jpg" → "http://localhost:5001/uploads/avatars/vingroup.jpg"
 * - "backend/uploads/avatars/vingroup.jpg" → "http://localhost:5001/uploads/avatars/vingroup.jpg"
 */
export const buildAvatarUrl = (avatarPath) => {
  // Nếu không có avatar, trả về null
  if (!avatarPath) {
    return null;
  }

  // Nếu avatar đã là full URL (http/https), giữ nguyên
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }

  // Lấy BASE_URL từ env
  const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';

  // Xử lý relative path
  let cleanPath = avatarPath;

  // Loại bỏ "backend/" nếu có
  if (cleanPath.startsWith('backend/')) {
    cleanPath = cleanPath.substring(8); // Remove "backend/"
  }

  // Loại bỏ leading slash nếu có
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }

  // Build full URL
  return `${BASE_URL}/${cleanPath}`;
};

/**
 * Build avatar URLs cho array of objects
 * 
 * @param {Array} items - Array of objects có field avatar
 * @param {string} avatarField - Tên field chứa avatar path (default: 'avatar')
 * @returns {Array} - Array with full avatar URLs
 */
export const buildAvatarUrls = (items, avatarField = 'avatar') => {
  if (!Array.isArray(items)) {
    return items;
  }

  return items.map(item => ({
    ...item,
    [avatarField]: buildAvatarUrl(item[avatarField])
  }));
};

export default {
  buildAvatarUrl,
  buildAvatarUrls
};
