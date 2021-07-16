import express from "express"
const statsRouter = express.Router()
import * as statsController from "../controllers/stats.controller"

statsRouter.get("/", statsController.getAll)
statsRouter.get("/games", statsController.getGames)

export default statsRouter
