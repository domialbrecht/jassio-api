import winston from "winston"

const options: winston.LoggerOptions = {
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === "production" ? "error" : "debug"
    }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "full.log", level: "debug" })
  ]
}

const logger = winston.createLogger(options)

export default logger
