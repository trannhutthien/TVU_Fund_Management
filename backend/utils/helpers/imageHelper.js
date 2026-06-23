import fs from "fs";
import path from "path";

/**
 * Image Helper
 *
 * Utility functions để xử lý image URLs cho donor avatars và fund images
 */

const getBaseUrl = () => process.env.BASE_URL || "http://localhost:5001";

const toRelativeUploadPath = (imagePath) => {
  if (!imagePath) return null;

  const rawPath = String(imagePath).trim();
  if (!rawPath) return null;

  try {
    const parsed = new URL(rawPath);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return parsed.pathname.replace(/^\/+/, "");
    }
    return null;
  } catch {
    return rawPath.replace(/^\/+/, "");
  }
};

const uploadFileExists = (relativePath) => {
  if (!relativePath || !relativePath.startsWith("uploads/")) return true;
  return fs.existsSync(path.join(process.cwd(), relativePath));
};

const buildAbsoluteUploadUrl = (relativePath) => {
  if (!relativePath || !relativePath.startsWith("uploads/")) return null;
  if (!uploadFileExists(relativePath)) return null;
  return `${getBaseUrl()}/${relativePath}`;
};

/**
 * Build full image URL từ relative path
 * 
 * @param {string} imagePath - Image path từ database
 * @param {string} type - Loại image: 'donor' | 'fund' | 'user' | 'document' | 'proof'
 * @returns {string|null} - Full image URL hoặc null
 * 
 * Xử lý các trường hợp:
 * - null/undefined → null
 * - "http://..." hoặc "https://..." → giữ nguyên
 * - "vingroup.jpg" → "http://localhost:5001/uploads/avatars/donor/vingroup.jpg"
 * - "uploads/avatars/vingroup.jpg" (legacy) → "http://localhost:5001/uploads/avatars/donor/vingroup.jpg"
 * - "uploads/avatars/donor/vingroup.jpg" → "http://localhost:5001/uploads/avatars/donor/vingroup.jpg"
 */
export const buildImageUrl = (imagePath, type = 'donor') => {
  // Nếu không có image, trả về null
  if (!imagePath) {
    return null;
  }

  const relativeFromUrl = toRelativeUploadPath(imagePath);

  // Nếu image đã là full URL ngoài hệ thống, giữ nguyên
  if (!relativeFromUrl && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }

  // Xử lý relative path
  let cleanPath = relativeFromUrl || imagePath;

  // Loại bỏ "backend/" nếu có
  if (cleanPath.startsWith('backend/')) {
    cleanPath = cleanPath.substring(8); // Remove "backend/"
  }

  // Loại bỏ leading slash nếu có
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }

  // Type path mapping
  const typePathMap = {
    donor: 'uploads/avatars/donor',
    fund: 'uploads/avatars/fund',
    user: 'uploads/avatars',
    document: 'uploads/documents',
    proof: 'uploads/proofs'
  };

  // XỬ LÝ LEGACY PATH: "uploads/avatars/vingroup.jpg" → "uploads/avatars/donor/vingroup.jpg"
  if (type === 'donor' && cleanPath.startsWith('uploads/avatars/') && !cleanPath.startsWith('uploads/avatars/donor/')) {
    // Extract filename từ legacy path
    const filename = cleanPath.replace('uploads/avatars/', '');
    // Rebuild với cấu trúc mới
    return buildAbsoluteUploadUrl(`uploads/avatars/donor/${filename}`);
  }

  // XỬ LÝ LEGACY PATH: "uploads/avatars/fund_image.jpg" → "uploads/avatars/fund/fund_image.jpg"
  if (type === 'fund' && cleanPath.startsWith('uploads/avatars/') && !cleanPath.startsWith('uploads/avatars/fund/')) {
    const filename = cleanPath.replace('uploads/avatars/', '');
    return buildAbsoluteUploadUrl(`uploads/avatars/fund/${filename}`);
  }

  // Nếu path đã có "uploads/", giữ nguyên
  if (cleanPath.startsWith('uploads/')) {
    return buildAbsoluteUploadUrl(cleanPath);
  }

  // Nếu chỉ có tên file, thêm path tương ứng với type
  const basePath = typePathMap[type] || 'uploads/avatars';
  return buildAbsoluteUploadUrl(`${basePath}/${cleanPath}`);
};

/**
 * Build donor avatar URL
 * @param {string} avatarPath - Avatar path từ database
 * @returns {string|null} - Full avatar URL
 */
export const buildDonorAvatarUrl = (avatarPath) => {
  return buildImageUrl(avatarPath, 'donor');
};

/**
 * Build fund image URL
 * @param {string} imagePath - Image path từ database
 * @returns {string|null} - Full image URL
 */
export const buildFundImageUrl = (imagePath) => {
  return buildImageUrl(imagePath, 'fund');
};

/**
 * Build user avatar URL
 * @param {string} avatarPath - Avatar path từ database
 * @returns {string|null} - Full avatar URL
 */
export const buildUserAvatarUrl = (avatarPath) => {
  return buildImageUrl(avatarPath, 'user');
};

/**
 * Build student showcase image URL
 * @param {string} imagePath - Image path từ database
 * @returns {string|null} - Full image URL
 */
export const buildStudentShowcaseImageUrl = (imagePath) => {
  if (!imagePath) return null;

  const relativeFromUrl = toRelativeUploadPath(imagePath);

  // Nếu đã là full URL ngoài hệ thống, giữ nguyên
  if (!relativeFromUrl && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }

  // Loại bỏ leading slash
  let cleanPath = relativeFromUrl || (imagePath.startsWith('/') ? imagePath.substring(1) : imagePath);
  
  // Nếu đã có "uploads/", giữ nguyên
  if (cleanPath.startsWith('uploads/')) {
    return buildAbsoluteUploadUrl(cleanPath);
  }
  
  // Nếu chỉ có tên file, thêm path mặc định
  return buildAbsoluteUploadUrl(`uploads/avatars/students/${cleanPath}`);
};

/**
 * Build image URLs cho array of objects
 * 
 * @param {Array} items - Array of objects có field image
 * @param {string} imageField - Tên field chứa image path (default: 'avatar')
 * @param {string} type - Loại image: 'donor' | 'fund' | 'user'
 * @returns {Array} - Array with full image URLs
 */
export const buildImageUrls = (items, imageField = 'avatar', type = 'donor') => {
  if (!Array.isArray(items)) {
    return items;
  }

  return items.map(item => ({
    ...item,
    [imageField]: buildImageUrl(item[imageField], type)
  }));
};

export default {
  buildImageUrl,
  buildDonorAvatarUrl,
  buildFundImageUrl,
  buildUserAvatarUrl,
  buildStudentShowcaseImageUrl,
  buildImageUrls
};
