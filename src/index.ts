import * as dotenv from "dotenv"
dotenv.config()
import express from "express"
import { createServer } from "http"
import favicon from "serve-favicon"
import errorHandler from "errorhandler"
import { instrument } from "@socket.io/admin-ui"
import { Server } from "socket.io"

import logger from "./util/logger"
import config from "./config"
import setupGameserver from "./game"


const isProduction = config.ENV === "production"
const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: [
      "https://admin.socket.io",
      "http://localhost:3333",
      "https://sirfilior.com",
    ],
  },
})
instrument(io, {
  auth: {
    type: "basic",
    username: "jassio_socketadmin",
    password: "$2b$10$PUWdnyYx23kZfn.pVJdGyuHD0ZkjaDTM3aszeDY3tQBw8VgGFgCrC"
  }
})

setupGameserver(io)


if (isProduction) {
  app.use(favicon(__dirname + "/public/images/favicon.ico"))
  app.use(express.static(__dirname + "public"))
}


//---------------------------------------------
//Setup all routes
//---------------------------------------------
import router from "./routes"
app.use(router)
//---------------------------------------------

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(errorHandler())
}

// Start APP
server.listen(config.PORT, () => logger.log("info", `Running, Listening on ${config.PORT}`))
