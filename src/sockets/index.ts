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

const sendCard = (game: Game) => {
  const hands = game.getPlayerCards()
  game.getPlayers().forEach((p, i) => {
    p.socket.emit("getCards", hands[i])
  })
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
      hands[i].forEach(c => {
        if (c.id === 15) {
          p.socket.emit("turnselect")
          game.roundStartPlace = p.place
          io.to(socket.roomKey).emit("playerturn", p.place)
          game.setPlayerTurn(p.place)
        }
      })
    })
  })
  socket.on("typeselected", (type: string) => {
    const game = GAMES.get(socket.roomKey)
    game.setRoundType(stringTypeToDeckType(type))

    //DEBUG
    game.getPlayers().forEach((p) => {
      console.log("======== PLAYER HAND ========")
      p.hand.forEach(c => {
        console.log(c)
      })
    })
    //END DEBUG

    io.to(socket.roomKey).emit("typegotselected", type)
  })
  socket.on("cardPlayed", (id: number, playerId: string) => {
    const game = GAMES.get(socket.roomKey)
    const player = game.getPlayer(playerId)
    if (!game.validPlay(player, id)) {
      socket.emit("wrongCard")
      return
    }
    game.playCard(id, socket.id)
    const currentStich = game.getCurrentStich()
    io.to(socket.roomKey).emit("cards", game.getStichCardsAndPlace())
    if (currentStich.length < 4) {
      const place = player.place + 1 <= 3 ? player.place + 1 : 0
      game.setPlayerTurn(place)
      io.to(socket.roomKey).emit("playerturn", place)
    } else {
      const stichInfo = game.completeStich()
      const winnerPlayer = game.getPlayer(stichInfo.nextPlayerId)
      io.to(socket.roomKey).emit("score", game.getScore())
      io.to(socket.roomKey).emit("clearboard")
      game.setPlayerTurn(winnerPlayer.place)
      if (stichInfo.roundFinished) {
        const hands = game.getPlayerCards()
        game.getPlayers().forEach((p, i) => {
          p.hand = hands[i]
          p.socket.emit("getCards", hands[i])
        })
        winnerPlayer.socket.emit("turnselect")
      }
      io.to(socket.roomKey).emit("playerturn", winnerPlayer.place)
    }

  })
}

export { socketHandler, GameSocket }