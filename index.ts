import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "http";
import favicon from "serve-favicon";
import logger from "./log";
import config from "./config";
import { handleError } from "./util/error";
import { instrument } from "@socket.io/admin-ui";
import { Server, Socket } from "socket.io";
import { socketHandler, GameSocket } from "./sockets";

import crypto from "crypto";
const randomId = () => crypto.randomBytes(8).toString("hex");
import Game from "./game/game";
import GameStore from "./game/gameStore"

const isProduction = config.ENV === "production";
const app = express();
const server = createServer(app);
const games: Game[] = [];

const io = new Server(server, {
  cors: {
    origin: [
      "https://admin.socket.io",
      "http://localhost:3000",
      "https://sirfilior.com",
    ],
  },
});
instrument(io, {
  auth: false
});


io.use((socket: GameSocket, next) => {
  const hs = socket.handshake.auth;
  const username = hs.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  if (hs.host) {
    socket.isHost = true;
    socket.roomKey = randomId();
  } else {
    if (!hs.key) return next(new Error("invalid join key"));
    if (!io.of("/").adapter.rooms.has(hs.key)) return next(new Error("invalid join key"));
    socket.roomKey = hs.key;
  }
  next();
});

const onConnection = async (socket: GameSocket) => {
  if (socket.isHost) {
    socket.emit("hosted", socket.roomKey);
  }
  socket.join(socket.roomKey);
  const so = await io.in(socket.roomKey).fetchSockets();
  const team = so.map((s) => {
    let gs = <GameSocket><unknown>s;
    return {
      id: gs.id,
      name: gs.username,
    }
  })
  socket.emit("players", team);
  const debugUsers = new Map();
  for (let [id, socket] of io.of("/").sockets) {
    const s = <GameSocket>socket;
    debugUsers.set(id, s.username);
  }
  console.log(debugUsers);
  socket.on('disconnect', async () => {
    debugUsers.delete(socket.id)
    console.log('user disconnected');
    console.log(debugUsers);
    const so = await io.in(socket.roomKey).fetchSockets();
    const team = so.map((s) => {
      let gs = <GameSocket><unknown>s;
      return {
        id: gs.id,
        name: gs.username,
      }
    })
    socket.emit("players", team);
  });
  socketHandler(io, socket);
};

io.on("connection", onConnection);

app.use(favicon(__dirname + "/public/images/favicon.ico"));
app.use(express.static("public"));

//---------------------------------------------
//Setup all routes
//---------------------------------------------
import router from "./routes";
app.use(router);
//---------------------------------------------

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function (err, req, res, next) {
    console.log(err.stack);
    handleError(err, res);
  });
}

//---------------------------------------------
// production error handler
// no stacktraces leaked to user
//---------------------------------------------
app.use(function (err, req, res, next) {
  handleError(err, res);
});
//---------------------------------------------

// Start APP
logger.log("info", `${new Date()} - Running, Listening on ${config.PORT}`);
server.listen(config.PORT, () => console.log(`Listening on ${config.PORT}`));
