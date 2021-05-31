import { Server, Socket } from "socket.io";
import { DeckType } from "../game/deck";
import { Game, GAMES } from "../game/game"

interface GameSocket extends Socket {
  username?: string,
  isHost?: boolean,
  roomKey?: string,
  place?: number
}

type TeamInfo = {
  pid: string,
  teamRed: number
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

const emitPlayers = (io: Server, game: Game, roomKey: string) => {
  const team = game.getPlayersSocket().map((s) => {
    let gs = <GameSocket><unknown>s;
    return {
      id: gs.id,
      isHost: gs.isHost,
      name: gs.username,
      place: gs.place
    }
  })
  io.to(roomKey).emit('players', team);
}

const socketHandler = (io: Server, socket: GameSocket) => {
  socket.on("settingChanged", (settings) => {
    GAMES.get(socket.roomKey).setSettings(settings)
    io.to(socket.roomKey).emit('newSettings', settings);
  });
  socket.on("playerteamchange", (pid: string, newTeam: number) => {
    const game = GAMES.get(socket.roomKey)
    game.players.get(pid).place = newTeam
    if (game.teamSwapLive) {
      emitPlayers(io, game, socket.roomKey)
      game.teamSwapLive = false
    } else {
      game.teamSwapLive = true
    }

  })
  socket.on("startGame", () => {
    const game = GAMES.get(socket.roomKey)
    game.startGame()
    io.to(socket.roomKey).emit('started');
    const hands = game.getPlayerCards();
    Array.from(game.players.values()).forEach((p, i) => {
      p.hand = hands[i]
      p.socket.emit('getCards', hands[i])
      hands[i].forEach(c => {
        if (c.value === 25) {
          p.socket.emit('turnselect')
          p.shouldPlay = true
        }
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
    const game = GAMES.get(socket.roomKey)
    let currentStich = game.getCurrentStich()
    game.playCard(id, socket.id)
    if (currentStich.length >= 4) {

    }

  })
};

export { socketHandler, GameSocket };