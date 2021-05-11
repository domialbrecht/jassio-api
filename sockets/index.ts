import { Server, Socket } from "socket.io";
import { GAMES } from "../game/game"

interface GameSocket extends Socket {
  username?: string,
  isHost?: boolean,
  roomKey?: string,
}

const socketHandler = (io: Server, socket: GameSocket) => {
  socket.on("settingChanged", (settings) => {
    GAMES.get(socket.roomKey).setSettings(settings)
    io.to(socket.roomKey).emit('newSettings', settings);
  });
};

export { socketHandler, GameSocket };