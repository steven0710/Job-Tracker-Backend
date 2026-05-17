import crypto from "crypto";
import { User } from "../models/user.model";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  emailSchema,
  loginUserSchema,
  registerUserSchema,
  resetPasswordSchema,
} from "../validators/user.validator";
import {
  sendVerificationEmail,
  sendForgotPasswordEmail,
} from "../services/email.service";
import { createUser } from "../services/user.service";
const registerUser = async (req: Request, res: Response) => {
  try {
    const parsed = registerUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Validation failed", issues: parsed.error.issues });
    }
    const { email, password } = parsed.data;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const token = await createUser(email, password);
    await sendVerificationEmail(email, token);

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const parsed = emailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Validation failed", issues: parsed.error.issues });
    }
    const email = parsed.data.email;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(200)
        .json({ message: "If that email exists, a reset link has been sent." });
    }

    const passwordVerificationToken = crypto.randomBytes(32).toString("hex");
    const passwordVerificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ); // 24 hours

    user.passwordResetToken = passwordVerificationToken;
    user.passwordResetTokenExpires = passwordVerificationTokenExpires;
    await user.save();

    await sendForgotPasswordEmail(user.email, passwordVerificationToken);

    res
      .status(200)
      .json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Invalid token" });
    }
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Validation failed", issues: parsed.error.issues });
    }
    const { password } = parsed.data;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.password = password;
    await user.save();
    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ message: "Server error" });
  }
};
const verifyRegistration = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Invalid token" });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ message: "Server error" });
  }
};

const resendRegistrationVerification = async (req: Request, res: Response) => {
  try {
    const parsed = emailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Validation failed", issues: parsed.error.issues });
    }
    const email = parsed.data.email;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ message: "Verification email sent successfully" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({ message: "Verification email sent successfully" });
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
    const email = parsed.data.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await user.comparePasswords(parsed.data.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
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

export {
  registerUser,
  loginUser,
  verifyRegistration,
  resendRegistrationVerification,
  forgotPassword,
  resetPassword,
};
