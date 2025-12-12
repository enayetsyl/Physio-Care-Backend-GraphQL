import crypto from "crypto";
   import { OTP } from "../models";
   import { config } from "../config";

   export class OTPService {
     static generateOTP(): string {
       return crypto.randomInt(100000, 999999).toString();
     }

     static async createOTP(mobile: string): Promise<string> {
       const otp = this.generateOTP();
       const expiresAt = new Date();
       expiresAt.setMinutes(expiresAt.getMinutes() + config.otp.expiryMinutes);

       // Invalidate previous OTPs for this mobile
       await OTP.updateMany({ mobile, verified: false }, { verified: true });

       await OTP.create({
         mobile,
         otp,
         expiresAt,
         verified: false,
         attempts: 0,
       });

       return otp;
     }

     static async verifyOTP(mobile: string, otp: string): Promise<boolean> {
       const otpRecord = await OTP.findOne({
         mobile,
         verified: false,
         expiresAt: { $gt: new Date() },
       }).sort({ createdAt: -1 });

       if (!otpRecord) {
         return false;
       }

       if (otpRecord.attempts >= 5) {
         throw new Error("Too many attempts. Please request a new OTP.");
       }

       if (otpRecord.otp !== otp) {
         otpRecord.attempts += 1;
         await otpRecord.save();
         return false;
       }

       otpRecord.verified = true;
       await otpRecord.save();
       return true;
     }
   }