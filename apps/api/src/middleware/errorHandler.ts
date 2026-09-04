import { Request, Response, NextFunction } from "express";
import { AxiosError } from "axios";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const isDev = env.NODE_ENV === "development";

  // Log basic info (never log passwords or secrets)
  // eslint-disable-next-line no-console
  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.path} - Error:`,
    {
      type:
        err instanceof AppError
          ? "AppError"
          : err instanceof AxiosError
            ? "AxiosError"
            : "Unknown",
      message: err instanceof Error ? err.message : "Unknown error",
      statusCode: err instanceof AppError ? err.statusCode : "N/A",
    },
  );

  if (err instanceof AppError) {
    const response: any = { error: err.message };
    if (err.details) {
      response.details = err.details;
    }
    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof AxiosError) {
    const status = err.response?.status || 500;
    const message =
      err.response?.data?.message || err.message || "External API error";
    const response: any = { error: message };
    // Include NIBSS response data so customer knows exact reason for failure (409 conflict, 400 bad input, etc)
    if (err.response?.data) {
      response.details = err.response.data;
    }
    res.status(status).json(response);
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      issues: err.issues,
    });
    return;
  }

  // Mongoose duplicate key error (11000)
  if (
    err instanceof Error &&
    "code" in err &&
    err.code === 11000 &&
    "keyPattern" in err
  ) {
    const field = Object.keys((err as any).keyPattern)[0];
    res.status(409).json({
      error: `${field} already exists`,
    });
    return;
  }

  // Mongoose validation error
  if (err instanceof Error && err.name === "ValidationError") {
    res.status(400).json({
      error: "Validation failed",
      details: isDev ? err.message : undefined,
    });
    return;
  }

  // Generic error
  res.status(500).json({
    error: isDev
      ? err instanceof Error
        ? err.message
        : String(err)
      : "Internal server error",
  });
}
