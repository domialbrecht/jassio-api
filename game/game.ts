import { Server, Socket } from "socket.io";
import { Card, Deck, DeckType, deckFactory } from "./deck"
const GAMES: Map<string, Game> = new Map()

enum Team {
  BLUE = 0,
  RED = 1
}

type GameSettings = {
  winAmount: number,
  enableWise: boolean,
}

type Player = {
  socket: Socket,
  hand: Card[],
  shouldPlay: boolean
  place: number
}

type PlayedCard = {
  cardId: number,
  cardValue: number
  playerId: string,
}

class Game {
  roomKey: string
  settings: GameSettings
  running: boolean
  teamSwapLive: boolean
  players: Map<string, Player> = new Map()
  playersOrdered: Array<Player>
  deck: Deck
  currentStich: Array<PlayedCard>
  constructor(key, host: Socket) {
    this.roomKey = key
    this.players.set(host.id, { socket: host, hand: [], shouldPlay: false, place: 0 })
    this.settings = { winAmount: 1000, enableWise: true }
    this.deck = this.createDeck(DeckType.TRUMPF_HEART) //Initial just for first play
    this.deck.buildDeck();
  }
  startGame(): void {
    this.running = true
  }
  getPlayerCards(): Array<Card[]> {
    return this.deck.distribute()
  }
  createDeck(type: DeckType): Deck {
    return deckFactory(type)
  }
  setRoundType(type: DeckType) {
    //HACK:: This is kinda bad, rework deck build and redistribute logic
    const deckOfRoundType = this.createDeck(type)
    deckOfRoundType.buildDeck()
    this.players.forEach(p => {
      p.hand.forEach(c => {
        c.value = deckOfRoundType.getCardValue(c.id)
        console.log("--------");
        console.log(c);
      })
    })
  }
  getCurrentStich(): PlayedCard[] {
    return this.currentStich;
  }
  playCard(cid: number, pid: string) {
    const cval = this.deck.getCardValue(cid)
    this.currentStich.push({ cardId: cid, playerId: pid, cardValue: cval })
  }
  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }
  getPlayersSocket(): Socket[] {
    return Array.from(this.players.values()).map((p) => p.socket);
  }
  addPlayer(player: Socket, place: number) {
    this.players.set(player.id, { hand: [], socket: player, shouldPlay: false, place: place })
  }
  removePlayer(id: string) {
    this.players.delete(id)
  }
  getSettings(): GameSettings {
    return this.settings
  }
  setSettings(settings: GameSettings) {
    this.settings = settings
  }
  serialize(): string {
    return "string"
  }
}

export { GAMES, Game };