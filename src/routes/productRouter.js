import express from "express";
import { body, param, validationResult } from "express-validator";
import { ObjectId } from "mongodb";
import BadRequestError from "../error/BadRequestError.js";
import DuplicateResourceError from "../error/DuplicateResourceError.js";
import NotFoundError from "../error/NotFoundError.js";
import connectToCluster from "../utility/mongoConnection.js";
import validateRequest from "../middleware/validateRequest.js";

const RESOURCE_NAME = "product";
const router = express.Router();

// MongoDB Connection
const client = await connectToCluster();
const database = client.db("dothack-nodejs");
const products = database.collection("products");

router.get("/", async (_, res) => {
  try {
    const product = await products.find().toArray();
    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:productId",
  param("productId").isMongoId().withMessage("ID specified is invalid"),
  validateRequest,
  async (req, res, next) => {
    const { productId } = req.params;
    try {
      const query = { _id: ObjectId(productId) };

      const product = await products.findOne(query);
      if (product === null) {
        throw new NotFoundError(RESOURCE_NAME, "id", productId);
      }

      res.json(product);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  [
    body("name")
      .trim()
      .escape()
      .exists({ checkFalsy: true, checkNull: true })
      .withMessage("Name field missing and cannot be empty"),
    body("cost")
      .exists({ checkFalsy: true, checkNull: true })
      .withMessage("Cost field missing")
      .bail()
      .isNumeric()
      .withMessage("Cost needs to be a numeric value"),
  ],
  validateRequest,
  async (req, res, next) => {
    const { name, cost } = req.body;
    const payload = { name, cost };

    try {
      if ((await products.findOne({ name })) !== null) {
        throw new DuplicateResourceError(RESOURCE_NAME, "name", name);
      }

      const data = await products.insertOne({ name, cost });
      res.status(201).json({ ...payload, _id: data.insertedId });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:productId",
  [
    param("productId").isMongoId().withMessage("ID specified is invalid"),
    body("name").trim().escape(),
  ],
  validateRequest,
  async (req, res, next) => {
    if ("name" in req.body) {
      await body("name")
        .exists({ checkFalsy: true, checkNull: true })
        .withMessage("Name field missing and cannot be empty")
        .run(req);
    }
    if ("cost" in req.body) {
      await body("cost")
        .exists({ checkFalsy: true, checkNull: true })
        .withMessage("Cost field missing")
        .bail()
        .isNumeric()
        .withMessage("Cost needs to be a numeric value")
        .run(req);
    }
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new BadRequestError(errors.array()[0].msg);
      }
    } catch (error) {
      next(error);
    }

    const { productId } = req.params;
    const { name, cost } = req.body;

    try {
      const id = ObjectId(productId);
      const payload = { name, cost };

      // Remove keys that has undefined values
      Object.keys(payload).forEach(
        (k) => payload[k] == null && delete payload[k]
      );

      if ((await products.findOne({ _id: id })) === null) {
        throw new NotFoundError(RESOURCE_NAME, "id", productId);
      }
      if (name && (await products.findOne({ name })) !== null) {
        throw new DuplicateResourceError(RESOURCE_NAME, "name", name);
      }

      const filter = { _id: id };
      const update = { $set: payload };
      await products.updateOne(filter, update);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:productId",
  [
    param("productId").isMongoId().withMessage("ID specified is invalid"),
    body("name")
      .trim()
      .escape()
      .exists({ checkFalsy: true, checkNull: true })
      .withMessage("Name field missing"),
    body("cost")
      .exists({ checkFalsy: true, checkNull: true })
      .withMessage("Cost field missing")
      .bail()
      .isNumeric()
      .withMessage("cost needs to be a numeric value"),
  ],
  validateRequest,
  async (req, res, next) => {
    const { productId } = req.params;
    const { name, cost } = req.body;

    try {
      const id = ObjectId(productId);

      if ((await products.findOne({ _id: id })) === null) {
        throw new NotFoundError(RESOURCE_NAME, "id", productId);
      }
      if (name && (await products.findOne({ name })) !== null) {
        throw new DuplicateResourceError(RESOURCE_NAME, "name", name);
      }

      const filter = { _id: id };
      const update = { $set: { name, cost } };
      await products.updateOne(filter, update);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:productId",
  param("productId").isMongoId().withMessage("ID specified is invalid"),
  validateRequest,
  async (req, res, next) => {
    const { productId } = req.params;
    try {
      const id = ObjectId(productId);

      if ((await products.findOne({ _id: id })) === null) {
        throw new NotFoundError(RESOURCE_NAME, "id", productId);
      }
      await products.deleteOne({ _id: id });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
