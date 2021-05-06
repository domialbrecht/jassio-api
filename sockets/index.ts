import { Server, Socket } from "socket.io";

interface GameSocket extends Socket {
  username?: string,
  isHost?: boolean,
  roomKey?: string,
}

const socketHandler = (io: Server, socket: GameSocket) => {
  const log = (payload) => {
    console.log(payload);
    io.emit("chat message", payload);
  };
  socket.on("chat message", log);
};

export { socketHandler, GameSocket };