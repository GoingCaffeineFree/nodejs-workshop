import cors from "cors";
import express from "express";
import morgan from "morgan";
import authRouter from "./routes/authRouter.js";
import productRouter from "./routes/productRouter.js";

const app = express();
const port = process.env.port ?? 8080;

// Middleware
app.use(morgan("combined"));
app.use(cors());
app.use(express.json());

// Routers
app.use("/auth", authRouter);
app.use("/products", productRouter);

// GET Route
app.get("/", (req, res) => {
  res.json({ msg: "Hello World!" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode ?? 500).json({
    error: err.error ?? "Something went wrong",
    msg: err.message ?? "Please try again later",
  });
});

// Open listening port for connection
app.listen(port, (err) => {
  if (err) console.error(err);
  console.log(`NodeJS listening on port ${port}`);
});
