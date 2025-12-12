import { verifyToken, JWTPayload } from "../utils/jwt";
import { GraphQLError } from "graphql";

export interface AuthContext {
  user?: JWTPayload;
}

export const authenticate = (req: {
  headers?: { authorization?: string };
}): AuthContext => {
  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: undefined };
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);
    return { user: payload };
  } catch (error) {
    return { user: undefined };
  }
};

export const requireAuth = (context: AuthContext): JWTPayload => {
  if (!context.user) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return context.user;
};
