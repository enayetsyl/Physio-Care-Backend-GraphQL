"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../src/models");
const otp_service_1 = require("../../src/services/otp.service");
const auth_resolver_1 = require("../../src/graphql/resolvers/auth.resolver");
describe("Auth Resolver Integration Tests", () => {
    describe("sendOTP mutation", () => {
        it("should create and return OTP for valid mobile", async () => {
            const mobile = "01712345678";
            const result = await auth_resolver_1.authResolver.Mutation.sendOTP(null, { mobile });
            expect(result).toBe(true);
            // Verify OTP was created in database
            const otpRecord = await models_1.OTP.findOne({ mobile, verified: false });
            expect(otpRecord).toBeDefined();
            expect(otpRecord?.otp).toHaveLength(6);
            expect(otpRecord?.mobile).toBe(mobile);
        });
        it("should invalidate previous OTPs when creating new one", async () => {
            const mobile = "01712345678";
            // Create first OTP
            await otp_service_1.OTPService.createOTP(mobile);
            const firstOTP = await models_1.OTP.findOne({ mobile, verified: false });
            // Create second OTP
            await auth_resolver_1.authResolver.Mutation.sendOTP(null, { mobile });
            // First OTP should be invalidated
            const firstOTPAfter = await models_1.OTP.findById(firstOTP?._id);
            expect(firstOTPAfter?.verified).toBe(true);
            // New OTP should exist
            const newOTP = await models_1.OTP.findOne({ mobile, verified: false });
            expect(newOTP).toBeDefined();
            expect(newOTP?._id.toString()).not.toBe(firstOTP?._id.toString());
        });
        it("should send email if user exists with email", async () => {
            const mobile = "01712345679";
            const email = "test@example.com";
            // Create user with email
            await models_1.User.create({
                name: "Test User",
                mobile,
                email,
            });
            // Mock EmailService.sendOTP to avoid actual email sending
            const emailService = require("../../src/services/email.service");
            const sendOTPSpy = jest
                .spyOn(emailService.EmailService, "sendOTP")
                .mockResolvedValue(undefined);
            await auth_resolver_1.authResolver.Mutation.sendOTP(null, { mobile });
            // Verify email service was called
            expect(sendOTPSpy).toHaveBeenCalled();
            sendOTPSpy.mockRestore();
        });
        it("should throw validation error for invalid mobile", async () => {
            const invalidMobile = "123"; // Invalid mobile number
            await expect(auth_resolver_1.authResolver.Mutation.sendOTP(null, { mobile: invalidMobile })).rejects.toThrow();
        });
    });
    describe("verifyOTP mutation", () => {
        it("should verify OTP and return token for existing user", async () => {
            const mobile = "01712345680";
            const email = "test@example.com";
            // Create user
            const user = await models_1.User.create({
                name: "Test User",
                mobile,
                email,
            });
            // Create and get OTP
            const otp = await otp_service_1.OTPService.createOTP(mobile);
            // Verify OTP
            const result = await auth_resolver_1.authResolver.Mutation.verifyOTP(null, {
                mobile,
                otp,
            });
            expect(result.token).toBeDefined();
            expect(result.user._id.toString()).toBe(user._id.toString());
            expect(result.user.mobile).toBe(mobile);
            // Verify OTP is marked as verified
            const otpRecord = await models_1.OTP.findOne({ mobile, otp });
            expect(otpRecord?.verified).toBe(true);
        });
        it("should create new user and return token when user doesn't exist", async () => {
            const mobile = "01712345681";
            const otp = await otp_service_1.OTPService.createOTP(mobile);
            const userDetails = {
                name: "New User",
                mobile: mobile, // Required by createUserSchema
                email: "newuser@example.com",
                gender: "male",
            };
            const result = await auth_resolver_1.authResolver.Mutation.verifyOTP(null, {
                mobile,
                otp,
                userDetails,
            });
            expect(result.token).toBeDefined();
            expect(result.user.mobile).toBe(mobile);
            expect(result.user.name).toBe(userDetails.name);
            expect(result.user.email).toBe(userDetails.email);
            // Verify user was created in database
            const createdUser = await models_1.User.findOne({ mobile });
            expect(createdUser).toBeDefined();
        });
        it("should throw error when user doesn't exist and no userDetails provided", async () => {
            const mobile = "01712345682";
            const otp = await otp_service_1.OTPService.createOTP(mobile);
            await expect(auth_resolver_1.authResolver.Mutation.verifyOTP(null, {
                mobile,
                otp,
            })).rejects.toThrow("User details required for new users");
        });
        it("should throw error for invalid OTP", async () => {
            const mobile = "01712345683";
            await otp_service_1.OTPService.createOTP(mobile);
            await expect(auth_resolver_1.authResolver.Mutation.verifyOTP(null, {
                mobile,
                otp: "000000", // Invalid OTP
            })).rejects.toThrow("Invalid OTP");
        });
        it("should throw error for expired OTP", async () => {
            const mobile = "01712345684";
            // Create OTP manually with expired date
            const expiredDate = new Date();
            expiredDate.setMinutes(expiredDate.getMinutes() - 10);
            await models_1.OTP.create({
                mobile,
                otp: "123456",
                expiresAt: expiredDate,
                verified: false,
                attempts: 0,
            });
            await expect(auth_resolver_1.authResolver.Mutation.verifyOTP(null, {
                mobile,
                otp: "123456",
            })).rejects.toThrow("Invalid OTP");
        });
        it("should throw validation error for invalid mobile format", async () => {
            await expect(auth_resolver_1.authResolver.Mutation.verifyOTP(null, {
                mobile: "123", // Invalid
                otp: "123456",
            })).rejects.toThrow();
        });
    });
    describe("refreshToken mutation", () => {
        it("should refresh token for authenticated user", async () => {
            const user = await models_1.User.create({
                name: "Test User",
                mobile: "01712345685",
                email: "test@example.com",
            });
            const context = {
                user: {
                    id: user._id.toString(),
                    mobile: user.mobile,
                },
            };
            const result = await auth_resolver_1.authResolver.Mutation.refreshToken(null, null, context);
            expect(result.token).toBeDefined();
            expect(result.user._id.toString()).toBe(user._id.toString());
            // Verify token is valid
            const { verifyToken } = require("../../src/utils/jwt");
            const decoded = verifyToken(result.token);
            expect(decoded.id).toBe(user._id.toString());
        });
        it("should throw error when user is not authenticated", async () => {
            const context = {
                user: undefined,
            };
            await expect(auth_resolver_1.authResolver.Mutation.refreshToken(null, null, context)).rejects.toThrow("Not authenticated");
        });
        it("should throw error when user doesn't exist", async () => {
            const context = {
                user: {
                    id: "507f1f77bcf86cd799439011", // Non-existent user ID
                    mobile: "01799999999",
                },
            };
            await expect(auth_resolver_1.authResolver.Mutation.refreshToken(null, null, context)).rejects.toThrow("User not found");
        });
    });
    describe("OTP attempt limits", () => {
        it("should increment attempts on wrong OTP", async () => {
            const mobile = "01712345686";
            const email = "test@example.com";
            // Create user first
            await models_1.User.create({
                name: "Test User",
                mobile,
                email,
            });
            const correctOTP = await otp_service_1.OTPService.createOTP(mobile);
            // Try wrong OTP multiple times
            for (let i = 0; i < 3; i++) {
                try {
                    await auth_resolver_1.authResolver.Mutation.verifyOTP(null, {
                        mobile,
                        otp: "000000",
                    });
                }
                catch (error) {
                    // Expected to fail
                }
            }
            // Get the OTP record after attempts
            const otpRecord = await models_1.OTP.findOne({ mobile, verified: false });
            expect(otpRecord).toBeDefined();
            expect(otpRecord?.attempts).toBeGreaterThanOrEqual(1);
            // Create a new OTP for the correct verification
            const newOTP = await otp_service_1.OTPService.createOTP(mobile);
            // Should work with new correct OTP
            const result = await auth_resolver_1.authResolver.Mutation.verifyOTP(null, {
                mobile,
                otp: newOTP,
            });
            expect(result.token).toBeDefined();
        });
        it("should throw error after 5 failed attempts", async () => {
            const mobile = "01712345687";
            const email = "test@example.com";
            // Create user first
            await models_1.User.create({
                name: "Test User",
                mobile,
                email,
            });
            await otp_service_1.OTPService.createOTP(mobile);
            // Create OTP record and manually set attempts to 5
            const otpRecord = await models_1.OTP.findOne({ mobile, verified: false });
            if (otpRecord) {
                otpRecord.attempts = 5;
                await otpRecord.save();
            }
            // The error from OTPService is caught and converted to internal error
            await expect(auth_resolver_1.authResolver.Mutation.verifyOTP(null, {
                mobile,
                otp: "000000",
            })).rejects.toThrow();
        });
    });
});
//# sourceMappingURL=auth.resolver.test.js.map