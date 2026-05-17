import { z } from "zod";

export const registerUserSchema = z
  .object({
    // username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email").trim().toLowerCase(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(30, "Password must not exceed 30 characters"),
  })
  .strict();

export const loginUserSchema = z
  .object({
    email: z.string().email("Invalid email").trim().toLowerCase(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(30, "Password must not exceed 30 characters"),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(30, "Password must not exceed 30 characters"),
  })
  .strict();

export const emailSchema = z
  .object({
    email: z.string().email("Invalid email").trim().toLowerCase(),
  })
  .strict();
