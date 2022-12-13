import express from "express";
import { ObjectId } from "mongodb";
import connectToCluster from "../utility/mongoConnection.js";

const router = express.Router();

// MongoDB Connection
const client = await connectToCluster();
const database = client.db("dothack-nodejs");
const products = database.collection("products");

router.get("/", async (_, res) => {
  const product = await products.find().toArray();
  res.json(product);
});

router.get("/:productId", async (req, res) => {
  const { productId } = req.params;
  const query = { _id: ObjectId(productId) };

  const product = await products.findOne(query);
  if (product === null) {
    return res.status(404).json({
      error: "Resource Not Found",
      message: `Product with id: '${productId}' does not exist`,
    });
  }

  res.json(product);
});

router.post("/", async (req, res) => {
  const { name, cost } = req.body;
  const payload = { name, cost };

  if ((await products.findOne({ name })) !== null) {
    return res.status(409).json({
      error: "Duplicated values",
      message: `Product with name: '${name}' already exist`,
    });
  }

  const data = await products.insertOne({ name, cost });
  res.status(201).json({ ...payload, _id: data.insertedId });
});

router.patch("/:productId", async (req, res) => {
  const { name, cost } = req.body;
  const { productId } = req.params;

  const id = ObjectId(productId);
  const payload = { name, cost };

  // Remove keys that has undefined values
  Object.keys(payload).forEach((k) => payload[k] == null && delete payload[k]);

  if ((await products.findOne({ _id: id })) === null) {
    return res.status(404).json({
      error: "Resource Not Found",
      message: `Product with id: '${productId}' does not exist`,
    });
  }
  if (name && (await products.findOne({ name })) !== null) {
    return res.status(409).json({
      error: "Duplicated values",
      message: `Product with name: '${name}' already exist`,
    });
  }

  const filter = { _id: id };
  const update = { $set: payload };
  await products.updateOne(filter, update);
  res.status(204).send();
});

router.put("/:productId", async (req, res) => {
  const { productId } = req.params;
  const { name, cost } = req.body;
  const id = ObjectId(productId);

  if ((await products.findOne({ _id: id })) === null) {
    return res.status(404).json({
      error: "Resource Not Found",
      message: `Product with id: '${productId}' does not exist`,
    });
  }
  if ((await products.findOne({ name })) !== null) {
    return res.status(409).json({
      error: "Duplicated values",
      message: `Product with name: '${name}' already exist`,
    });
  }

  const filter = { _id: id };
  const update = { $set: { name, cost } };
  await products.updateOne(filter, update);
  res.status(204).send();
});

router.delete("/:productId", async (req, res) => {
  const { productId } = req.params;
  const id = ObjectId(productId);

  if ((await products.findOne({ _id: id })) === null) {
    return res.status(404).json({
      error: "Resource Not Found",
      message: `Product with id: '${productId}' does not exist`,
    });
  }
  await products.deleteOne({ _id: id });
  res.status(204).send();
});

export default router;
