import { Server, Socket } from "socket.io"
import { DeckType } from "../game/deck"
import { Game, GAMES } from "../game/game"

interface GameSocket extends Socket {
  username?: string,
  isHost?: boolean,
  roomKey?: string,
  place?: number
}

//HACK: Implement shared enum DeckType for Client, add DeckType.toString in Client
const stringTypeToDeckType = (type: string): DeckType => {
  switch (type) {
    case "Obeabe":
      return DeckType.UPDOWN
    case "Undeufe":
      return DeckType.UPDOWN
    case "Slalom":
      return DeckType.UPDOWN
    case "Trumpf_heart":
      return DeckType.UPDOWN
    case "Trumpf_diamond":
      return DeckType.UPDOWN
    case "Trumpf_spade":
      return DeckType.UPDOWN
    case "Trumpf_club":
      return DeckType.UPDOWN
    default:
      return DeckType.UPDOWN
  }
}

const emitPlayers = (io: Server, game: Game, roomKey: string) => {
  const team = game.getPlayersSocketAndPlace().map((s) => {
    const gs = <GameSocket><unknown>s.socket
    return {
      id: gs.id,
      isHost: gs.isHost,
      name: gs.username,
      place: s.place
    }
  })
  io.to(roomKey).emit("players", team)
}

const socketHandler = (io: Server, socket: GameSocket) => {
  socket.on("settingChanged", (settings) => {
    GAMES.get(socket.roomKey).setSettings(settings)
    io.to(socket.roomKey).emit("newSettings", settings)
  })
  socket.on("swapplayerteam", (p1id: string, p2id: string) => {
    const game = GAMES.get(socket.roomKey)
    const p1 = game.players.get(p1id)
    const p2 = game.players.get(p2id)
    const p1Place = p1.place
    const p2Place = p2.place
    p1.place = p2Place
    p2.place = p1Place
    emitPlayers(io, game, socket.roomKey)

  })
  socket.on("startGame", () => {
    const game = GAMES.get(socket.roomKey)
    game.startGame()
    io.to(socket.roomKey).emit("started")
    const hands = game.getPlayerCards()
    game.getPlayers().forEach((p, i) => {
      p.hand = hands[i]
      p.socket.emit("getCards", hands[i])
      console.log("======== PLAYER HAND ========")
      hands[i].forEach(c => {
        console.log(c)
        if (c.id === 15) {
          p.socket.emit("turnselect")
          io.to(socket.roomKey).emit("playerturn", p.place)
          p.shouldPlay = true
        }
      })
    })
  })
  socket.on("typeselected", (type: string) => {
    const game = GAMES.get(socket.roomKey)
    game.setRoundType(stringTypeToDeckType(type))
    io.to(socket.roomKey).emit("typegotselected", type)
  })
  socket.on("cardPlayed", (id: number, playerId: string) => {
    const game = GAMES.get(socket.roomKey)
    const player = game.getPlayer(playerId)
    if (!player.shouldPlay) return
    game.playCard(id, socket.id)
    const currentStich = game.getCurrentStich()
    io.to(socket.roomKey).emit("cards", game.getStichCardsAndPlace())
    if (currentStich.length < 4) {
      const place = player.place + 1 <= 3 ? player.place + 1 : 0
      game.getPlayers().find(p => p.place == place).shouldPlay = true
      io.to(socket.roomKey).emit("playerturn", place)
    } else {
      io.to(socket.roomKey).emit("clearboard")
    }

  })
}

export { socketHandler, GameSocket }