import express from "express"
import exampleRouter from "./example.route"
import statsRouter from "./stats.route"
const router = express.Router()

router.get("/", (req, res) => {
  res.end("Hello, from example api. Have a good day!")
})

router.use("/example", exampleRouter)
router.use("/stats", statsRouter)

export default router
