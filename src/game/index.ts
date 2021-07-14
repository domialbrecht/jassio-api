import { socketHandler, GameSocket } from "../sockets"
import crypto from "crypto"
import { Server } from "socket.io"
import { GAMES, Game } from "./game"


export default function setupGameserver(io: Server): void {
  const randomId = () => crypto.randomBytes(8).toString("hex")

  io.use((socket: GameSocket, next) => {
    const hs = socket.handshake.auth
    const username = hs.username
    if (!username) {
      return next(new Error("invalid username"))
    }
    socket.username = username
    if (hs.host) {
      socket.isHost = true
      socket.roomKey = randomId()
    } else {
      if (!hs.key) return next(new Error("invalid join key"))
      if (!io.of("/").adapter.rooms.has(hs.key)) return next(new Error("invalid join key"))
      socket.roomKey = hs.key
    }
    next()
  })

  const onConnection = async (socket: GameSocket) => {
    if (socket.isHost) {
      GAMES.set(socket.roomKey, new Game(socket.roomKey, socket, io))
      socket.emit("hosted", socket.roomKey)
    } else {
      const game = GAMES.get(socket.roomKey)
      game.addPlayer(socket, game.getPlayers().length)
      //console.log(GAMES.get(socket.roomKey));
      socket.emit("initialSettings", GAMES.get(socket.roomKey).getSettings())
    }
    await socket.join(socket.roomKey)
    const team = GAMES.get(socket.roomKey).getPlayersSocket().map((s) => {
      const gs = <GameSocket><unknown>s
      return {
        id: gs.id,
        isHost: gs.isHost,
        name: gs.username,
        place: GAMES.get(socket.roomKey).getPlayers().find(p => p.socket.id === gs.id).place
      }
    })
    io.to(socket.roomKey).emit("players", team)

    //FIXME: REMOVE DEBUG
    const debugUsers = new Map()
    for (const [id, socket] of io.of("/").sockets) {
      const s = <GameSocket>socket
      debugUsers.set(id, s.username)
    }
    //console.log(debugUsers);
    //END DEBUG

    socket.on("disconnect", async () => {

      //FIXME: REMOVE DEBUG
      debugUsers.delete(socket.id)
      //console.log('user disconnected');
      //console.log(debugUsers);
      //END DEBUG

      if (socket.isHost) {
        io.to(socket.roomKey).emit("abandoned")
        GAMES.delete(socket.roomKey)
      } else {
        if (!GAMES.get(socket.roomKey)) return //Game abandoned
        GAMES.get(socket.roomKey).removePlayer(socket.id)
        const team = GAMES.get(socket.roomKey).getPlayersSocket().map((s) => {
          const gs = <GameSocket><unknown>s
          return {
            id: gs.id,
            isHost: gs.isHost,
            name: gs.username,
            place: GAMES.get(socket.roomKey).getPlayers().find(p => p.socket.id === gs.id).place
          }
        })
        io.to(socket.roomKey).emit("players", team)
      }
    })
    socketHandler(io, socket)
  }

  io.on("connection", onConnection)
}
