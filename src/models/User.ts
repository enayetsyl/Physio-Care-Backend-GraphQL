import mongoose, { Document, Schema } from "mongoose";

   export interface IUser extends Document {
     name: string;
     mobile: string;
     email: string;
     dateOfBirth?: Date;
     gender?: "male" | "female" | "other";
     age?: number;
     weight?: number;
     height?: number;
     bloodGroup?: string;
     isActive: boolean;
     createdAt: Date;
     updatedAt: Date;
   }

   const userSchema = new Schema<IUser>(
     {
       name: {
         type: String,
         required: [true, "Name is required"],
         trim: true,
         minlength: [2, "Name must be at least 2 characters"],
         maxlength: [100, "Name cannot exceed 100 characters"],
       },
       mobile: {
         type: String,
         required: [true, "Mobile number is required"],
         unique: true,
         match: [/^[6-9]\d{9}$/, "Please enter a valid Indian mobile number"],
       },
       email: {
         type: String,
         required: [true, "Email is required"],
         unique: true,
         lowercase: true,
         match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
       },
       dateOfBirth: Date,
       gender: {
         type: String,
         enum: ["male", "female", "other"],
       },
       age: {
         type: Number,
         min: [0, "Age cannot be negative"],
         max: [150, "Age seems invalid"],
       },
       weight: {
         type: Number,
         min: [0, "Weight cannot be negative"],
       },
       height: {
         type: Number,
         min: [0, "Height cannot be negative"],
       },
       bloodGroup: {
         type: String,
         enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
       },
       isActive: {
         type: Boolean,
         default: true,
       },
     },
     {
       timestamps: true,
     }
   );

   // Index for faster queries
   userSchema.index({ mobile: 1 });
   userSchema.index({ email: 1 });

   export const User = mongoose.model<IUser>("User", userSchema);