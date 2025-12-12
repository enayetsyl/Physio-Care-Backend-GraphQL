import dotenv from "dotenv";
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "4000", 10),
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/physiocare",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10),
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },
};
