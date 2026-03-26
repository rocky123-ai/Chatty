import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res
        .status(401)
        .json({ message: "Unauthorized - no token provided" });

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    return next();
  } catch (error) {
    console.log("Error in middleware of auth : " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};
