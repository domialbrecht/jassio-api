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
  socket.on("startGame", () => {
    io.to(socket.roomKey).emit('started');
    const hands = GAMES.get(socket.roomKey).getPlayerHands();
    console.log(hands);
    GAMES.get(socket.roomKey).getPlayers().forEach((p, i) => p.emit('getCards', hands[i]))
  })
};

export { socketHandler, GameSocket };