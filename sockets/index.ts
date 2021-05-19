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
    const game = GAMES.get(socket.roomKey)
    game.startGame()
    io.to(socket.roomKey).emit('started');
    const hands = game.getPlayerCards();
    console.log(hands);
    Array.from(game.players.values()).forEach((p, i) => {
      p.hand = hands[i]
      p.socket.emit('getCards', hands[i])
      hands[i].forEach(c => {
        p.shouldPlay = true
        if (c.value === 15) p.socket.emit('turn_select')
      })
    })
    console.log(game.players);
  })
};

export { socketHandler, GameSocket };