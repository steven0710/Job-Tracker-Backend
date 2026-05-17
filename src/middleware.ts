import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "./types/auth-request";

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const JWT_SECRET = process.env.JWT_SECRET as string;
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!JWT_SECRET) {
    return res.status(500).json({ message: "Server misconfigured" });
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = decoded; // attach userId to req object
    next(); // continue to route handler
  } catch (err) {
    console.log("JWT verification error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
