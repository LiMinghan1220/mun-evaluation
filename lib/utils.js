// 生成6位随机数字ID
export function generateUniqueId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 中间件：验证JWT token
export function verifyToken(token) {
  try {
    if (!token) return null;
    return jwt.verify(token, process.env.NEXTAUTH_SECRET);
  } catch (error) {
    return null;
  }
}
