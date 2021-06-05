import express from "express"
const exampleRouter = express.Router()
import * as exampleController from "../controllers/example.controller"

exampleRouter.get("/", exampleController.getAll)

export default exampleRouter
