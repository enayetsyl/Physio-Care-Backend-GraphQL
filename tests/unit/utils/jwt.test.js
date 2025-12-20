"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("../../../src/utils/jwt");
describe("JWT Utils", () => {
    describe("generateToken", () => {
        it("should generate a valid token", () => {
            const payload = { id: "123", mobile: "9876543210" };
            const token = (0, jwt_1.generateToken)(payload);
            expect(token).toBeDefined();
            expect(typeof token).toBe("string");
            expect(token.split(".")).toHaveLength(3); // JWT has 3 parts separated by dots
        });
        it("should generate different tokens for different payloads", () => {
            const payload1 = { id: "123", mobile: "9876543210" };
            const payload2 = { id: "456", mobile: "9876543211" };
            const token1 = (0, jwt_1.generateToken)(payload1);
            const token2 = (0, jwt_1.generateToken)(payload2);
            expect(token1).not.toBe(token2);
        });
        it("should generate tokens with valid structure", () => {
            const payload = { id: "123", mobile: "9876543210" };
            const token = (0, jwt_1.generateToken)(payload);
            // JWT tokens have 3 parts: header.payload.signature
            const parts = token.split(".");
            expect(parts).toHaveLength(3);
            // Each part should be a valid base64 string
            parts.forEach((part) => {
                expect(part).toBeTruthy();
                expect(part.length).toBeGreaterThan(0);
            });
        });
    });
    describe("verifyToken", () => {
        it("should verify a valid token", () => {
            const payload = { id: "123", mobile: "9876543210" };
            const token = (0, jwt_1.generateToken)(payload);
            const decoded = (0, jwt_1.verifyToken)(token);
            expect(decoded.id).toBe(payload.id);
            expect(decoded.mobile).toBe(payload.mobile);
        });
        it("should throw error for invalid token", () => {
            expect(() => (0, jwt_1.verifyToken)("invalid-token")).toThrow("Invalid or expired token");
        });
        it("should throw error for empty token", () => {
            expect(() => (0, jwt_1.verifyToken)("")).toThrow("Invalid or expired token");
        });
        it("should throw error for malformed token", () => {
            expect(() => (0, jwt_1.verifyToken)("not.a.valid.jwt.token")).toThrow("Invalid or expired token");
        });
        it("should verify token with different payloads correctly", () => {
            const payload1 = { id: "user1", mobile: "9876543210" };
            const payload2 = { id: "user2", mobile: "9876543211" };
            const token1 = (0, jwt_1.generateToken)(payload1);
            const token2 = (0, jwt_1.generateToken)(payload2);
            const decoded1 = (0, jwt_1.verifyToken)(token1);
            const decoded2 = (0, jwt_1.verifyToken)(token2);
            expect(decoded1.id).toBe("user1");
            expect(decoded1.mobile).toBe("9876543210");
            expect(decoded2.id).toBe("user2");
            expect(decoded2.mobile).toBe("9876543211");
        });
    });
    describe("Token round-trip", () => {
        it("should generate and verify token successfully", () => {
            const originalPayload = {
                id: "test-user-id",
                mobile: "9876543210",
            };
            const token = (0, jwt_1.generateToken)(originalPayload);
            const verifiedPayload = (0, jwt_1.verifyToken)(token);
            expect(verifiedPayload.id).toBe(originalPayload.id);
            expect(verifiedPayload.mobile).toBe(originalPayload.mobile);
        });
    });
});
//# sourceMappingURL=jwt.test.js.map