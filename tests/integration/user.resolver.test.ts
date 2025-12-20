import { User } from "../../src/models";
import { userResolver } from "../../src/graphql/resolvers/user.resolver";
import { AuthContext } from "../../src/middleware/auth.middleware";
import { generateToken } from "../../src/utils/jwt";

describe("User Resolver Integration Tests", () => {
  describe("me query", () => {
    it("should return current user when authenticated", async () => {
      const user = await User.create({
        name: "Test User",
        mobile: "01712345690",
        email: "test@example.com",
      });

      const context: AuthContext = {
        user: {
          id: user._id.toString(),
          mobile: user.mobile,
        },
      };

      const result = await userResolver.Query.me(null, null, context);

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(user._id.toString());
      expect(result.name).toBe(user.name);
      expect(result.mobile).toBe(user.mobile);
      expect(result.email).toBe(user.email);
    });

    it("should throw error when not authenticated", async () => {
      const context: AuthContext = {
        user: undefined,
      };

      await expect(userResolver.Query.me(null, null, context)).rejects.toThrow(
        "Not authenticated"
      );
    });

    it("should throw error when user doesn't exist", async () => {
      const context: AuthContext = {
        user: {
          id: "507f1f77bcf86cd799439011", // Non-existent user ID
          mobile: "01799999999",
        },
      };

      await expect(userResolver.Query.me(null, null, context)).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("user query", () => {
    it("should return user by ID", async () => {
      const user = await User.create({
        name: "Test User",
        mobile: "01712345691",
        email: "test1@example.com",
      });

      const result = await userResolver.Query.user(null, {
        id: user._id.toString(),
      });

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(user._id.toString());
      expect(result.name).toBe(user.name);
    });

    it("should throw error when user not found", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";

      await expect(
        userResolver.Query.user(null, { id: nonExistentId })
      ).rejects.toThrow("User not found");
    });
  });

  describe("users query", () => {
    it("should return all active users", async () => {
      // Create active users
      await User.create({
        name: "Active User 1",
        mobile: "01712345692",
        email: "active1@example.com",
        isActive: true,
      });

      await User.create({
        name: "Active User 2",
        mobile: "01712345693",
        email: "active2@example.com",
        isActive: true,
      });

      // Create inactive user
      await User.create({
        name: "Inactive User",
        mobile: "01712345694",
        email: "inactive@example.com",
        isActive: false,
      });

      const result = await userResolver.Query.users();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result.every((u) => u.isActive === true)).toBe(true);
    });

    it("should return empty array when no active users", async () => {
      // Create only inactive users
      await User.create({
        name: "Inactive User",
        mobile: "01712345695",
        email: "inactive2@example.com",
        isActive: false,
      });

      const result = await userResolver.Query.users();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("updateProfile mutation", () => {
    it("should update user profile when authenticated", async () => {
      const user = await User.create({
        name: "Original Name",
        mobile: "01712345696",
        email: "original@example.com",
      });

      const context: AuthContext = {
        user: {
          id: user._id.toString(),
          mobile: user.mobile,
        },
      };

      const input = {
        name: "Updated Name",
        age: 25,
        weight: 70,
        height: 175,
      };

      const result = await userResolver.Mutation.updateProfile(
        null,
        { input },
        context
      );

      expect(result.name).toBe("Updated Name");
      expect(result.age).toBe(25);
      expect(result.weight).toBe(70);
      expect(result.height).toBe(175);

      // Verify in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.name).toBe("Updated Name");
      expect(updatedUser?.age).toBe(25);
    });

    it("should update blood group with enum conversion", async () => {
      const user = await User.create({
        name: "Test User",
        mobile: "01712345697",
        email: "test@example.com",
      });

      const context: AuthContext = {
        user: {
          id: user._id.toString(),
          mobile: user.mobile,
        },
      };

      const input = {
        bloodGroup: "A_POSITIVE", // GraphQL enum format
      };

      const result = await userResolver.Mutation.updateProfile(
        null,
        { input },
        context
      );

      // Verify blood group was converted to DB format
      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.bloodGroup).toBe("A+"); // DB format
    });

    it("should throw error when not authenticated", async () => {
      const context: AuthContext = {
        user: undefined,
      };

      await expect(
        userResolver.Mutation.updateProfile(
          null,
          { input: { name: "New Name" } },
          context
        )
      ).rejects.toThrow("Not authenticated");
    });

    it("should throw error when user doesn't exist", async () => {
      const context: AuthContext = {
        user: {
          id: "507f1f77bcf86cd799439011", // Non-existent user ID
          mobile: "01799999999",
        },
      };

      await expect(
        userResolver.Mutation.updateProfile(
          null,
          { input: { name: "New Name" } },
          context
        )
      ).rejects.toThrow("User not found");
    });

    it("should throw validation error for invalid input", async () => {
      const user = await User.create({
        name: "Test User",
        mobile: "01712345698",
        email: "test@example.com",
      });

      const context: AuthContext = {
        user: {
          id: user._id.toString(),
          mobile: user.mobile,
        },
      };

      // Invalid input: name too short
      await expect(
        userResolver.Mutation.updateProfile(
          null,
          { input: { name: "A" } }, // Less than 2 characters
          context
        )
      ).rejects.toThrow();
    });

    it("should update only provided fields", async () => {
      const user = await User.create({
        name: "Original Name",
        mobile: "01712345699",
        email: "original@example.com",
        age: 20,
        weight: 60,
      });

      const context: AuthContext = {
        user: {
          id: user._id.toString(),
          mobile: user.mobile,
        },
      };

      // Update only name
      const result = await userResolver.Mutation.updateProfile(
        null,
        { input: { name: "Updated Name" } },
        context
      );

      expect(result.name).toBe("Updated Name");
      expect(result.age).toBe(20); // Should remain unchanged
      expect(result.weight).toBe(60); // Should remain unchanged
    });
  });

  describe("User type resolvers", () => {
    it("should convert _id to id string", async () => {
      const user = await User.create({
        name: "Test User",
        mobile: "01712345700",
        email: "test@example.com",
      });

      const context: AuthContext = {
        user: {
          id: user._id.toString(),
          mobile: user.mobile,
        },
      };

      const result = await userResolver.Query.me(null, null, context);

      // Test the id resolver
      const id = userResolver.User.id(result as any);
      expect(id).toBe(user._id.toString());
    });

    it("should convert blood group from DB to GraphQL enum", async () => {
      const user = await User.create({
        name: "Test User",
        mobile: "01712345701",
        email: "test@example.com",
        bloodGroup: "A+", // DB format
      });

      const context: AuthContext = {
        user: {
          id: user._id.toString(),
          mobile: user.mobile,
        },
      };

      const result = await userResolver.Query.me(null, null, context);

      // Test the bloodGroup resolver
      const bloodGroup = userResolver.User.bloodGroup(result);
      expect(bloodGroup).toBe("A_POSITIVE"); // GraphQL enum format
    });

    it("should return null for blood group when not set", async () => {
      const user = await User.create({
        name: "Test User",
        mobile: "01712345702",
        email: "test@example.com",
        // No bloodGroup
      });

      const context: AuthContext = {
        user: {
          id: user._id.toString(),
          mobile: user.mobile,
        },
      };

      const result = await userResolver.Query.me(null, null, context);

      const bloodGroup = userResolver.User.bloodGroup(result);
      expect(bloodGroup).toBeNull();
    });

    it("should convert dates to ISO strings", async () => {
      const user = await User.create({
        name: "Test User",
        mobile: "01712345703",
        email: "test@example.com",
        dateOfBirth: new Date("1990-01-01"),
      });

      const context: AuthContext = {
        user: {
          id: user._id.toString(),
          mobile: user.mobile,
        },
      };

      const result = await userResolver.Query.me(null, null, context);

      const createdAt = userResolver.User.createdAt(result);
      const updatedAt = userResolver.User.updatedAt(result);
      const dateOfBirth = userResolver.User.dateOfBirth(result);

      expect(typeof createdAt).toBe("string");
      expect(typeof updatedAt).toBe("string");
      expect(typeof dateOfBirth).toBe("string");
      expect(new Date(createdAt).toISOString()).toBe(createdAt);
      expect(new Date(updatedAt).toISOString()).toBe(updatedAt);
      if (dateOfBirth) {
        expect(new Date(dateOfBirth).toISOString()).toBe(dateOfBirth);
      }
    });
  });
});
