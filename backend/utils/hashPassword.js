import bcrypt from "bcryptjs";

// Script để hash mật khẩu
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  console.log(`Mật khẩu: ${password}`);
  console.log(`Hash: ${hashed}`);
  return hashed;
};

// Hash mật khẩu "password123"
hashPassword("password123");
