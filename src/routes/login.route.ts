import express from "express"
import passport from "passport"
import jwt from "jsonwebtoken"
const loginRouter = express.Router()

loginRouter.post(
  "/signup",
  async (req, res, next) => {
    passport.authenticate("signup", { session: false }, async (err, user) => {
      if (err) {
        return next(err)
      }
      if (!user) {
        return res.status(400).json({
          message: "Something is not right",
          user: user
        })
      }
      req.login(
        user,
        { session: false },
        async (error) => {
          if (error) return next(error)
          const body = { email: user.email }
          const token = jwt.sign({ user: body }, process.env.TOKEN_SECRET, { expiresIn: "1d" })
          return res.json({ email: user.email, access_token: token })
        }
      )
    })(req, res, next)
  }
)

loginRouter.post(
  "/login",
  async (req, res, next) => {
    passport.authenticate(
      "login",
      async (err, user, info) => {
        try {
          if (err) {
            return next(err)
          }
          if (!user) {
            return res.status(400).json({
              message: "Something is not right",
              user: user
            })
          }

          req.login(
            user,
            { session: false },
            async (error) => {
              if (error) return next(error)
              const body = { email: user.email }
              const token = jwt.sign({ user: body }, process.env.TOKEN_SECRET, { expiresIn: "1d" })
              return res.json({ email: user.email, access_token: token })
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
