import { validationResult } from "express-validator";
import BadRequestError from "../error/BadRequestError.js";

export default function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new BadRequestError(errors.array()[0].msg));
  }
  next();
}
