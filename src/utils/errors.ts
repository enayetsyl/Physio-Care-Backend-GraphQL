import { GraphQLError } from "graphql";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
  }
}

export const handleZodError = (error: ZodError): GraphQLError => {
  const messages = error.issues.map(
    (err) => `${err.path.join(".")}: ${err.message}`
  );
  return new GraphQLError(`Validation error: ${messages.join(", ")}`, {
    extensions: { code: "VALIDATION_ERROR", details: error.issues },
  });
};

export const handleError = (error: unknown): GraphQLError => {
  if (error instanceof ZodError) {
    return handleZodError(error);
  }

  if (error instanceof AppError) {
    return new GraphQLError(error.message, {
      extensions: { code: error.code },
    });
  }

  if (error instanceof GraphQLError) {
    return error;
  }

  console.error("Unexpected error:", error);
  return new GraphQLError("Internal server error", {
    extensions: { code: "INTERNAL_ERROR" },
  });
};
