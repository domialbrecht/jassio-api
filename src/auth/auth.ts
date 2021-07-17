import * as bcrypt from "bcrypt"
import passport from "passport"
import * as passportLocal from "passport-local"
import * as passportjwt from "passport-jwt"
const LocalStrategy = passportLocal.Strategy
import prisma from "../client"

const isValidPassword = async (password: string, userPwd: string) => {
  const compare = await bcrypt.compare(password, userPwd)

  return compare
}

const hashPassword = async (password: string) => {
  const hash = await bcrypt.hash(password, 10)

  return hash
}



passport.use(
  "signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    async (email, password, done) => {
      try {
        const hashPwd = await hashPassword(password)
        const user = await prisma.user.create({
          data: {
            email: email,
            password: hashPwd
          }
        })

        return done(null, user)
      } catch (error) {
        done(error)
      }
    }
  )
)

passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email: email } })
        if (!user) {
          return done(null, false, { message: "User not found" })
        }

        const validate = await isValidPassword(password, user.password)
        if (!validate) {
          return done(null, false, { message: "Wrong Password" })
        }

        return done(null, user, { message: "Logged in Successfully" })
      } catch (error) {
        return done(error)
      }
    }
  )
)


const JWTstrategy = passportjwt.Strategy
const ExtractJWT = passportjwt.ExtractJwt

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.TOKEN_SECRET,
      jwtFromRequest: ExtractJWT.fromUrlQueryParameter("secret_token")
    },
    async (token, done) => {
      try {
        return done(null, token.user)
      } catch (error) {
        done(error)
      }
    }
  )
)