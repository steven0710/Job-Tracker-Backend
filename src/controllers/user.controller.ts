import { User } from "../models/user.model";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validators/user.validator";
const registerUser = async (req: Request, res: Response) => {
  try {
    const parsed = registerUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Validation failed", issues: parsed.error.issues });
    }
    const email = parsed.data.email.toLowerCase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({
      ...parsed.data,
      email,
    });
    const JWT_SECRET = process.env.JWT_SECRET as string;
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(201).json({
      message: "User registered successfully",
      id: user._id,
      email: user.email,
      username: user.username,
      token: token,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const parsed = loginUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Validation failed", issues: parsed.error.issues });
    }

    const JWT_SECRET = process.env.JWT_SECRET as string;
    if (!JWT_SECRET) {
      return res.status(500).json({ message: "Server misconfigured" });
    }
    const email = parsed.data.email.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await user.comparePasswords(parsed.data.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({
      message: "Login successful",
      username: user.username,
      token: token,
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ message: "Server error" });
  }
};

export { registerUser, loginUser };
