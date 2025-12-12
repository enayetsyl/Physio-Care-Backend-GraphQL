import { handleError } from "../../utils/errors";

/**
 * Recursively wraps resolver functions to normalize errors via handleError.
 * Works with resolver maps or arrays of resolver maps.
 */
export const wrapResolvers = <T>(resolverMap: T): T => {
  const wrapValue = (value: unknown): unknown => {
    if (typeof value === "function") {
      return async (...args: unknown[]) => {
        try {
          return await value(...args);
        } catch (error) {
          throw handleError(error);
        }
      };
    }

    if (Array.isArray(value)) {
      return value.map(wrapValue);
    }

    if (value && typeof value === "object") {
      const wrappedEntries = Object.entries(value).map(([key, val]) => [
        key,
        wrapValue(val),
      ]);
      return Object.fromEntries(wrappedEntries);
    }

    return value;
  };

  return wrapValue(resolverMap) as T;
};
