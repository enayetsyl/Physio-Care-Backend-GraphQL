import { generateToken, verifyToken, JWTPayload } from "../../../src/utils/jwt";

describe("JWT Utils", () => {
  describe("generateToken", () => {
    it("should generate a valid token", () => {
      const payload: JWTPayload = { id: "123", mobile: "9876543210" };
      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts separated by dots
    });

    it("should generate different tokens for different payloads", () => {
      const payload1: JWTPayload = { id: "123", mobile: "9876543210" };
      const payload2: JWTPayload = { id: "456", mobile: "9876543211" };

      const token1 = generateToken(payload1);
      const token2 = generateToken(payload2);

      expect(token1).not.toBe(token2);
    });

    it("should generate tokens with valid structure", () => {
      const payload: JWTPayload = { id: "123", mobile: "9876543210" };
      const token = generateToken(payload);

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
      const payload: JWTPayload = { id: "123", mobile: "9876543210" };
      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.mobile).toBe(payload.mobile);
    });

    it("should throw error for invalid token", () => {
      expect(() => verifyToken("invalid-token")).toThrow(
        "Invalid or expired token"
      );
    });

    it("should throw error for empty token", () => {
      expect(() => verifyToken("")).toThrow("Invalid or expired token");
    });

    it("should throw error for malformed token", () => {
      expect(() => verifyToken("not.a.valid.jwt.token")).toThrow(
        "Invalid or expired token"
      );
    });

    it("should verify token with different payloads correctly", () => {
      const payload1: JWTPayload = { id: "user1", mobile: "9876543210" };
      const payload2: JWTPayload = { id: "user2", mobile: "9876543211" };

      const token1 = generateToken(payload1);
      const token2 = generateToken(payload2);

      const decoded1 = verifyToken(token1);
      const decoded2 = verifyToken(token2);

      expect(decoded1.id).toBe("user1");
      expect(decoded1.mobile).toBe("9876543210");
      expect(decoded2.id).toBe("user2");
      expect(decoded2.mobile).toBe("9876543211");
    });
  });

  describe("Token round-trip", () => {
    it("should generate and verify token successfully", () => {
      const originalPayload: JWTPayload = {
        id: "test-user-id",
        mobile: "9876543210",
      };

      const token = generateToken(originalPayload);
      const verifiedPayload = verifyToken(token);

      expect(verifiedPayload.id).toBe(originalPayload.id);
      expect(verifiedPayload.mobile).toBe(originalPayload.mobile);
    });
  });
});
