import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "http";
import cors from "cors";
import favicon from "serve-favicon";
import { instrument } from "@socket.io/admin-ui";
import { Server } from "socket.io";

import * as Sentry from "@sentry/node";

import logger from "./util/logger";
import config from "./config";
import setupGameserver from "./game";

const CORS = {
  origin: [
    "https://admin.socket.io",
    "http://localhost:5173",
    "https://jasse.io",
  ],
};

const isProduction = config.ENV === "production";
const app = express();
app.use(cors(CORS));

Sentry.init({
  dsn: "https://82e31ebe7d154ae7a3fbfc1506278561@o921723.ingest.sentry.io/5868374",
  tracesSampleRate: 0.1,
});

app.use(Sentry.Handlers.requestHandler());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = createServer(app);
const io = new Server(server, {
  cors: CORS,
});
instrument(io, {
  auth: {
    type: "basic",
    username: "jassio_socketadmin",
    password: "$2b$10$PUWdnyYx23kZfn.pVJdGyuHD0ZkjaDTM3aszeDY3tQBw8VgGFgCrC",
  },
});

setupGameserver(io);

const outDir = isProduction ? __dirname : __dirname + "/../";
app.use(favicon(outDir + "/public/images/favicon.ico"));
app.use(express.static(outDir + "public"));

//---------------------------------------------
//Setup all routes
//---------------------------------------------
import "./auth/auth";
import router from "./routes";
app.use(router);
//---------------------------------------------

//Sentry errror handler
app.use(Sentry.Handlers.errorHandler());

if (isProduction) {
  app.use(function onError(_err: any, _req: any, res: any, _next: any) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.end(res.sentry + "\n");
  });
}

// Start APP
server.listen(config.PORT, () =>
  logger.log("info", `Running, Listening on ${config.PORT}`),
);
