import express from "express";
import exampleRouter from "./example.route";
var router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello, from example api. Have a good day!");
});

router.use("/example", exampleRouter);

export default router
