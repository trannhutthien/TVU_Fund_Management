import bcrypt from "bcryptjs";

/**
 * Script tạo hash cho mật khẩu
 * Dùng để copy vào SQL script
 */
const generateHash = async () => {
  const password = "123456";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log("═══════════════════════════════════════");
  console.log("BCRYPT HASH GENERATOR");
  console.log("═══════════════════════════════════════");
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log("═══════════════════════════════════════");
  console.log("\nCopy hash này vào SQL script:");
  console.log(`'${hash}'`);
  console.log("═══════════════════════════════════════\n");
};

generateHash();
