import { User } from "../../models";
   import { OTPService } from "../../services/otp.service";
   import { EmailService } from "../../services/email.service";
   import { generateToken } from "../../utils/jwt";
   import { requireAuth } from "../../middleware/auth.middleware";
   import { GraphQLError } from "graphql";
   import { AuthContext } from "../../middleware/auth.middleware";

   export const authResolver = {
     Mutation: {
       sendOTP: async (_: unknown, { mobile }: { mobile: string }) => {
         const otp = await OTPService.createOTP(mobile);

         // In production, send via SMS gateway. For now, log it
         console.log(`OTP for ${mobile}: ${otp}`);

         // If user exists, send email
         const user = await User.findOne({ mobile });
         if (user && user.email) {
           await EmailService.sendOTP(user.email, otp);
         }

         return true;
       },

       verifyOTP: async (
         _: unknown,
         {
           mobile,
           otp,
           userDetails,
         }: {
           mobile: string;
           otp: string;
           userDetails?: Record<string, unknown>;
         }
       ) => {
         const isValid = await OTPService.verifyOTP(mobile, otp);

         if (!isValid) {
           throw new GraphQLError("Invalid OTP", {
             extensions: { code: "INVALID_OTP" },
           });
         }

         let user = await User.findOne({ mobile });

         if (!user) {
           if (!userDetails) {
             throw new GraphQLError("User details required for new users", {
               extensions: { code: "USER_DETAILS_REQUIRED" },
             });
           }

           user = await User.create({
             mobile,
             name: userDetails.name as string,
             email: userDetails.email as string,
             dateOfBirth: userDetails.dateOfBirth
               ? new Date(userDetails.dateOfBirth as string)
               : undefined,
             gender: userDetails.gender as
               | "male"
               | "female"
               | "other"
               | undefined,
           });
         }

         const token = generateToken({
           id: user._id.toString(),
           mobile: user.mobile,
         });

         return {
           token,
           user,
         };
       },

       refreshToken: async (_: unknown, __: unknown, context: AuthContext) => {
         const userPayload = requireAuth(context);
         const user = await User.findById(userPayload.id);

         if (!user) {
           throw new GraphQLError("User not found", {
             extensions: { code: "NOT_FOUND" },
           });
         }

         const token = generateToken({
           id: user._id.toString(),
           mobile: user.mobile,
         });

         return {
           token,
           user,
         };
       },
     },
   };