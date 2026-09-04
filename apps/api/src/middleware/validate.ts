import { RequestHandler } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/AppError.js";

export function validate(schema: ZodSchema): RequestHandler {
  return async (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        new AppError(400, "Validation failed", {
          issues: result.error.issues,
        }),
      );
    }
    req.body = result.data;
    next();
  };
}

/**
 * Same as `validate`, but reads and rewrites `req.query`.
 * Use for endpoints with pagination / filter query params. The parsed result
 * carries coerced + defaulted values (Express hands query params in as strings).
 */
export function validateQuery(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(
        new AppError(400, "Invalid query parameters", {
          issues: result.error.issues,
        }),
      );
    }
    // Cast: Express types req.query as ParsedQs and won't accept the coerced shape.
    req.query = result.data as any;
    next();
  };
}
