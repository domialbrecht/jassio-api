import { Socket } from "socket.io"
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
  place: number
}

type PlayedCard = {
  cardId: number,
  cardValue: number,
  cardDisplay: string,
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
  constructor(key: string, host: Socket) {
    this.roomKey = key
    this.players.set(host.id, { socket: host, hand: [], shouldPlay: false, place: 0 })
    this.settings = { winAmount: 1000, enableWise: true }
    this.deck = this.createDeck(DeckType.TRUMPF_HEART) //Initial just for first play
    this.deck.buildDeck()
    this.currentStich = []
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
  setRoundType(type: DeckType): void {
    //HACK:: This is kinda bad, rework deck build and redistribute logic
    const deckOfRoundType = this.createDeck(type)
    deckOfRoundType.buildDeck()
    this.players.forEach(p => {
      p.hand.forEach(c => {
        c.value = deckOfRoundType.getCardValueById(c.id)
      })
    })
  }
  getCurrentStich(): PlayedCard[] {
    return this.currentStich
  }
  getStichCardsAndPlace(): { display: string, place: number }[] {
    return this.currentStich.map((c) => {
      return { display: c.cardDisplay, place: this.players.get(c.playerId).place }
    })
  }
  playCard(cid: number, pid: string): void {
    const card = this.deck.getCardById(cid)
    this.getCurrentStich().push({ cardId: cid, playerId: pid, cardValue: card.value, cardDisplay: card.display })
  }
  getPlayers(): Player[] {
    return Array.from(this.players.values())
  }
  getPlayer(id: string): Player {
    return this.players.get(id)
  }
  getPlayersSocket(): Socket[] {
    return Array.from(this.players.values()).map((p) => p.socket)
  }
  getPlayersSocketAndPlace(): { socket: Socket, place: number }[] {
    return Array.from(this.players.values()).map((p) => {
      return { socket: p.socket, place: p.place }
    })
  }
  addPlayer(player: Socket, place: number): void {
    this.players.set(player.id, { hand: [], socket: player, shouldPlay: false, place: place })
  }
  removePlayer(id: string): void {
    this.players.delete(id)
  }
  getSettings(): GameSettings {
    return this.settings
  }
  setSettings(settings: GameSettings): void {
    this.settings = settings
  }
  serialize(): string {
    return "string"
  }
}

export { GAMES, Game }