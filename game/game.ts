import { Server, Socket } from "socket.io";
import { Card, Deck, DeckType, deckFactory } from "./deck"
const GAMES: Map<string, Game> = new Map()

type GameSettings = {
  winAmount: number,
  enableWise: boolean,
}

type Player = {
  socket: Socket,
  hand: Card[],
  shouldPlay: boolean
}

class Game {
  roomKey: string
  settings: GameSettings
  running: boolean
  players: Map<string, Player> = new Map()
  deck: Deck
  constructor(key, host: Socket) {
    this.roomKey = key
    this.players.set(host.id, { socket: host, hand: [], shouldPlay: false })
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
  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }
  getPlayersSocket(): Socket[] {
    return Array.from(this.players.values()).map((p) => p.socket);
  }
  addPlayer(player: Socket) {
    this.players.set(player.id, { hand: [], socket: player, shouldPlay: false })
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