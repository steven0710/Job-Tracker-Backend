import crypto from "crypto";
import { User } from "../models/user.model";

export async function createUser(email: string, password: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await User.create({
    email,
    password,
    verificationToken: token,
    verificationTokenExpires: expires,
  });

  return token;
}
