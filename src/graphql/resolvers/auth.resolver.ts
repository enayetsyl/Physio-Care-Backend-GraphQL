import { User } from "../../models";
import { OTPService } from "../../services/otp.service";
import { EmailService } from "../../services/email.service";
import { generateToken } from "../../utils/jwt";
import { requireAuth } from "../../middleware/auth.middleware";
import { GraphQLError } from "graphql";
import { AuthContext } from "../../middleware/auth.middleware";
import {
  createUserSchema,
  otpSchema,
  sendOTPSchema,
} from "../../validators/user.validator";
import { handleError } from "../../utils/errors";

export const authResolver = {
  Mutation: {
    sendOTP: async (_: unknown, { mobile }: { mobile: string }) => {
      try {
        sendOTPSchema.parse({ mobile });
        const otp = await OTPService.createOTP(mobile);

        // In production, send via SMS gateway. For now, log it
        console.log(`OTP for ${mobile}: ${otp}`);

        // If user exists, send email
        const user = await User.findOne({ mobile });
        if (user && user.email) {
          await EmailService.sendOTP(user.email, otp);
        }

        return true;
      } catch (error) {
        throw handleError(error);
      }
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
      try {
        otpSchema.parse({ mobile, otp });

        // Validate user details if provided (or when creating a new user)
        if (userDetails) {
          createUserSchema.parse(userDetails);
        }

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
      } catch (error) {
        throw handleError(error);
      }
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
