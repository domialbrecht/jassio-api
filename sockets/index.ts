import { Server, Socket } from "socket.io";
import { DeckType } from "../game/deck";
import { GAMES } from "../game/game"

interface GameSocket extends Socket {
  username?: string,
  isHost?: boolean,
  roomKey?: string,
}

//HACK: Implement shared enum DeckType for Client, add DeckType.toString in Client
const stringTypeToDeckType = (type: string): DeckType => {
  switch (type) {
    case 'Obeabe':
      return DeckType.UPDOWN
      break;
    case 'Undeufe':
      return DeckType.UPDOWN
      break;
    case 'Slalom':
      return DeckType.UPDOWN
      break;
    case 'Trumpf_heart':
      return DeckType.UPDOWN
      break;
    case 'Trumpf_diamond':
      return DeckType.UPDOWN
      break;
    case 'Trumpf_spade':
      return DeckType.UPDOWN
      break;
    case 'Trumpf_club':
      return DeckType.UPDOWN
      break;
    default:
      return DeckType.UPDOWN
      break;
  }
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
        if (c.value === 15) p.socket.emit('turnselect')
      })
    })
    console.log(game.players);
  })
  socket.on("typeselected", (type: string) => {
    const game = GAMES.get(socket.roomKey)
    console.log(game.players);
    game.setRoundType(stringTypeToDeckType(type))
    io.to(socket.roomKey).emit("typegotselected", type)
  })
  socket.on("cardPlayed", (id: number) => {
    console.log(id);
  })
};

export { socketHandler, GameSocket };