import express from "express";
const exampleRouter = express.Router();
import * as exampleController from "../controllers/example.controller";
import flatCacheMiddleware  from "../middleware/cache";

exampleRouter.get("/", flatCacheMiddleware, exampleController.getAll);

export default exampleRouter
