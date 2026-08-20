import crypto from "crypto";

export const GUEST_OTP_EXPIRY_MINUTES = 30;

export const getGuestOtpSecret = () =>
  process.env.GUEST_OTP_SECRET || process.env.JWT_SECRET || "tvu-fund-management-guest-otp-secret";

export const hashGuestOtp = (email, trackingUuid, otpCode) =>
  crypto.createHmac("sha256", getGuestOtpSecret()).update(`${email}:${trackingUuid}:${otpCode}`).digest("hex");

export const createGuestOtpExpiresAt = () => new Date(Date.now() + GUEST_OTP_EXPIRY_MINUTES * 60 * 1000);

export const signGuestOtpPayload = (payload) => {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", getGuestOtpSecret()).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
};

export const timingSafeStringEqual = (left, right) => {
  const a = Buffer.from(left || "");
  const b = Buffer.from(right || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

export const readGuestOtpPayload = (token, options = {}) => {
  if (!token || typeof token !== "string" || !token.includes("."))
    throw new Error("OTP_INVALID_OR_NOT_FOUND");
  const [encodedPayload, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", getGuestOtpSecret()).update(encodedPayload).digest("base64url");
  if (!timingSafeStringEqual(signature, expected)) throw new Error("OTP_INVALID_OR_NOT_FOUND");
  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  if (!options.allowExpired && (!payload.expiresAt || Date.now() > new Date(payload.expiresAt).getTime()))
    throw new Error("OTP_EXPIRED");
  return payload;
};

export const generateRandomPassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let pw = "";
  for (let i = 0; i < 12; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
  return pw;
};

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePhone = (phone) => /^[0-9]{10,11}$/.test(phone.trim());
export const validateBankAccountNumber = (n) => /^[0-9]{6,20}$/.test(n.trim());
export const isEmailDeliveryError = (e) => e?.code === "EMAIL_NOT_CONFIGURED" || e?.code === "EMAIL_SEND_FAILED";
