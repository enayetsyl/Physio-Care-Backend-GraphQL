import nodemailer from "nodemailer";
   import { config } from "../config";

   export class EmailService {
     private static transporter = nodemailer.createTransport({
       host: config.smtp.host,
       port: config.smtp.port,
       secure: false,
       auth: {
         user: config.smtp.user,
         pass: config.smtp.pass,
       },
     });

     static async sendOTP(email: string, otp: string): Promise<void> {
       const mailOptions = {
         from: config.smtp.user,
         to: email,
         subject: "Your PhysioCare OTP",
         html: `
           <h2>Your OTP for PhysioCare</h2>
           <p>Your OTP is: <strong>${otp}</strong></p>
           <p>This OTP will expire in ${config.otp.expiryMinutes} minutes.</p>
         `,
       };

       await this.transporter.sendMail(mailOptions);
     }
   }