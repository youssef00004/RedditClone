import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    // Get token from httpOnly cookie
    let token = req.cookies.token;

    // Fallback to Authorization header for backward compatibility
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: ... }
    next();
  } catch (error) {
    res.status(401).json({ message: "Token not valid" });
  }
};
