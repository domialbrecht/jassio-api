import express from "express"
import exampleRouter from "./example.route"
import statsRouter from "./stats.route"
import loginRouter from "./login.route"
import userRouter from "./user.route"
import passport from "passport"
const router = express.Router()

router.get("/", (req, res) => {
  res.end("Hello, from example api. Have a good day!")
})

router.use("/example", exampleRouter)
router.use("/stats", statsRouter)
router.use("/auth", loginRouter)
router.use("/user", passport.authenticate("jwt", { session: false }), userRouter)

export default router
