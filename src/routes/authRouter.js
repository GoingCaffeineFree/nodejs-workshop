import express from "express";
import { body } from "express-validator";
import DuplicatedResourceError from "../error/DuplicateResourceError.js";
import UnauthenticatedError from "../error/UnauthenticatedError.js";
import validateRequest from "../middleware/validateRequest.js";
import BcryptHelper from "../utility/bcryptHelper.js";
import JwtHelper from "../utility/jwtHelper.js";
import connectToCluster from "../utility/mongoConnection.js";

const RESOURCE_NAME = "user";
const router = express.Router();

// MongoDB Connection
const client = await connectToCluster();
const database = client.db("dothack-nodejs");
const users = database.collection("users");

router.post(
  "/login",
  [
    body("username")
      .trim()
      .escape()
      .exists({ checkFalsy: true, checkNull: true })
      .withMessage("Username missing"),
    body("password")
      .trim()
      .escape()
      .exists({ checkFalsy: true, checkNull: true })
      .withMessage("Password missing"),
  ],
  validateRequest,
  async (req, res, next) => {
    const { username, password } = req.body;

    try {
      const user = await users.findOne({ username });
      if (
        !user ||
        !(await BcryptHelper.verifyPassword(password, user.password))
      ) {
        throw new UnauthenticatedError();
      }

      const payload = { username };

      // Set role into JWT if role exists
      if (user.role) {
        payload.role = user.role;
      }
      const token = JwtHelper.sign(payload);
      res.json({ token });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/register",
  [
    body("username")
      .trim()
      .escape()
      .exists({ checkFalsy: true, checkNull: true })
      .withMessage("Username missing")
      .bail()
      .isLength({ min: 8 })
      .withMessage("Username needs to be minimally 8 characters long"),
    body("password")
      .trim()
      .escape()
      .exists({ checkFalsy: true, checkNull: true })
      .withMessage("Password missing")
      .bail()
      .isLength({ min: 8 })
      .withMessage("Password needs to be minimally 8 characters long"),
    body("cfmPassword")
      .trim()
      .escape()
      .exists({ checkFalsy: true, checkNull: true })
      .withMessage("Confirm Password missing")
      .bail()
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Confirm Password does not match"),
  ],
  validateRequest,
  async (req, res, next) => {
    const { username, password } = req.body;

    try {
      const user = await users.findOne({ username });
      if (user) {
        throw new DuplicatedResourceError(RESOURCE_NAME, "username", username);
      }

      const hash = await BcryptHelper.hashPassword(password);
      const payload = { username, password: hash };

      // Make the first user that has registered as an ADMIN
      // INFO: DO NOT DO THIS FOR ACTUAL APPLICATIONS!
      if ((await users.countDocuments()) === 0) {
        payload.role = "ADMIN";
      }

      await users.insertOne(payload);
      res.json({ msg: "Successful registration!" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
