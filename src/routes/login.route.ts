import express from "express"
import passport from "passport"
import jwt from "jsonwebtoken"
const loginRouter = express.Router()

loginRouter.post(
  "/signup",
  passport.authenticate("signup", { session: false }),
  async (req, res, next) => {
    res.json({
      message: "Signup successful",
      user: req.user
    })
  }
)

loginRouter.post(
  "/login",
  async (req, res, next) => {
    passport.authenticate(
      "login",
      async (err, user, info) => {
        try {
          if (err || !user) {
            const error = new Error("An error occurred.")
            return next(error)
          }

          req.login(
            user,
            { session: false },
            async (error) => {
              if (error) return next(error)
              const body = { email: user.email }
              const token = jwt.sign({ user: body }, process.env.TOKEN_SECRET)
              return res.json({ token })
            }
          )
        } catch (error) {
          return next(error)
        }
      }
    )(req, res, next)
  }
)



export default loginRouter
