import { RequestHandler } from "express";
import { Customer } from "../models/index.js";
import { AppError } from "../utils/AppError.js";

/**
 * GET /api/me
 *
 * Return the logged-in customer's own info.
 * Requires authenticateCustomer middleware (verifies JWT, sets req.customer).
 */
export const getMe: RequestHandler = async (req, _res, next) => {
  try {
    // authenticateCustomer middleware guarantees req.customer is set
    const customer = await Customer.findById(req.customer!.id);

    // Edge case: token is valid but customer was deleted from DB
    if (!customer) {
      return next(new AppError(404, "Customer not found"));
    }

    return _res.json({ customer });
  } catch (err) {
    next(err);
  }
};
