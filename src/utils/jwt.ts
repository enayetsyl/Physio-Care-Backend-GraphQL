import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { config } from "../config";

export interface JWTPayload {
  id: string;
  mobile: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as StringValue,
  });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
