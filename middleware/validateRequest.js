import { validationResult } from "express-validator";

export default function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      error: "Invalid values",
      message: errors.array()[0].msg,
    });
  }
  next();
}
