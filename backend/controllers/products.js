import express from "express";
import Products from "../models/products.js";

const Router = express.Router()

Router.get("/show-products", async (req, res) => {
  const data = await Products.find();

  res.json(data);
});

export default Router