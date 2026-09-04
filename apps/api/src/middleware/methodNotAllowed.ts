import { RequestHandler } from "express";

/**
 * Handler that returns 405 Method Not Allowed with an Allow header.
 * Mount with `router.all()` AFTER your real method handlers on a path,
 * to catch requests to that path with the wrong HTTP method.
 */
export function methodNotAllowed(allowedMethods: string[]): RequestHandler {
  return (req, res) => {
    res.set("Allow", allowedMethods.join(", "));
    res.status(405).json({
      error: "Method not allowed",
      method: req.method,
      path: req.originalUrl,
      allowed: allowedMethods,
    });
  };
}
