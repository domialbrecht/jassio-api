import { Socket, Server } from "socket.io"
import { Card, Deck, DeckType, deckFactory } from "./deck"
import { WisHandler, WisType, WisDeclare, WisInfo } from "./wise"
import logger from "../util/logger"
const GAMES: Map<string, Game> = new Map()

interface Score {
  teamA: number
  teamB: number
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
  card: Card,
  playerId: string,
}

export enum Team {
  TeamA,
  TeamB
}

class Game {
  roomKey: string
  io: Server
  settings: GameSettings
  running: boolean
  teamSwapLive: boolean
  players: Map<string, Player> = new Map()
  wishander: WisHandler
  roundStartPlace: number
  deck: Deck
  currentStich: Array<PlayedCard>
  stichCounter = 0
  stoeckPlayer: string | undefined = undefined
  playerHasSwitched: string | undefined
  score: Score = { teamA: 0, teamB: 0 }
  tempWisScore: Score = { teamA: 0, teamB: 0 }
  roundScore: Score = { teamA: 0, teamB: 0 }
  roundCounter: number
  constructor(key: string, host: Socket, io: Server) {
    this.roomKey = key
    this.io = io
    this.players.set(host.id, { socket: host, hand: [], shouldPlay: false, place: 0 })
    this.wishander = new WisHandler()
    this.settings = { winAmount: 1000, enableWise: true }
    this.deck = this.createDeck(DeckType.UPDOWN) //Initial just for first play
    this.deck.buildDeck()
    this.playerHasSwitched = undefined
    this.currentStich = []
    this.roundCounter = 0
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
    this.stoeckPlayer = undefined
    this.deck = this.createDeck(type)
    this.deck.buildDeck()
    //Do not hand out new card, but update existing val and score
    this.players.forEach(p => {
      if (this.stoeckPlayer === undefined) {
        this.setStoeckPlayer(p, type)
      }
      p.hand.forEach(c => {
        const card = this.deck.getCardById(c.id)
        c.value = card.value
        c.score = card.score
      })
    })
  }
  finishRound(): { nextPlayerId: string, roundFinished: boolean } {
    const nextRoundStartPlace = this.roundStartPlace + 1 > 3 ? 0 : this.roundStartPlace + 1
    this.roundCounter += 1
    if (this.roundScore.teamA === 0) {
      this.roundScore.teamB + 100
    } else {
      this.roundScore.teamA = this.roundScore.teamA + this.tempWisScore.teamA
    }
    if (this.roundScore.teamB === 0) {
      this.roundScore.teamA + 100
    } else {
      this.roundScore.teamB = this.roundScore.teamB + this.tempWisScore.teamB
    }


    this.score.teamA += this.roundScore.teamA
    this.score.teamB += this.roundScore.teamB
    this.roundScore = { teamA: 0, teamB: 0 }
    this.tempWisScore = { teamA: 0, teamB: 0 }
    this.io.to(this.roomKey).emit("cleartempwis")

    this.isGameFinished()

    return { nextPlayerId: this.getPlayers().find(p => p.place === nextRoundStartPlace).socket.id, roundFinished: true }
  }
  getCurrentStich(): PlayedCard[] {
    return this.currentStich
  }
  getStichCardsAndPlace(): { display: string, place: number }[] {
    return this.currentStich.map((c) => {
      return { display: c.card.display, place: this.players.get(c.playerId).place, value: c.card.value }
    })
  }
  getScore(): Score {
    return {
      teamA: this.score.teamA + this.roundScore.teamA,
      teamB: this.score.teamB + this.roundScore.teamB
    }
  }
  isGameFinished(): void {
    let winTeam
    if (this.score.teamA + this.tempWisScore.teamA >= this.settings.winAmount) winTeam = Team.TeamA
    else if (this.score.teamB + this.tempWisScore.teamB >= this.settings.winAmount) winTeam = Team.TeamB
    if (!winTeam) return
    else {
      //TODO: Store infos in DB
      this.io.to(this.roomKey).emit("win", winTeam)
    }
  }
  completeStich(): { nextPlayerId: string, roundFinished: boolean } {
    if (this.stichCounter === 0) {
      this.finishWise()
    }

    const winningCardId = this.deck.getStichWin(this.currentStich)
    let sum = 0
    let teamWin
    let playerWinId = this.currentStich[0].playerId
    this.currentStich.forEach(c => {
      sum += c.card.score
      if (c.card.id === winningCardId) {
        teamWin = this.getPlayerTeam(this.players.get(c.playerId))
        playerWinId = c.playerId
      }
    })
    if (teamWin === Team.TeamA) this.roundScore.teamA += sum
    else this.roundScore.teamB += sum
    this.isGameFinished()
    this.currentStich = []
    this.stichCounter += 1
    if (this.stichCounter === 9) {
      return this.finishRound()
    } else {
      return { nextPlayerId: playerWinId, roundFinished: false }
    }
  }
  validPlay(player: Player, cid: number): boolean {
    if (!player.shouldPlay) {
      logger.log("error", `Invalid Play: Player ${player.place} should not play`)
      return false
    }
    if (!player.hand.find(c => c.id === cid)) {
      logger.log("error", `Invalid Play: Player ${player.place} has not card`)
      return false
    }
    if (!this.validCard(cid, player)) return false
    return true
  }
  validCard(id: number, player: Player): boolean {
    if (this.currentStich && this.currentStich.length > 0) {
      const activeSuit = this.deck.getCardById(
        this.currentStich[0].card.id
      ).suit
      const playerHasSuit = player.hand.find(c => c.suit === activeSuit) ? true : false
      const prevCard = this.deck.getCardById(
        this.currentStich[this.currentStich.length - 1].card.id
      )
      const nextCard = this.deck.getCardById(id)
      logger.log("info", `Card Validation: ASuit: ${activeSuit}, PHas: ${playerHasSuit}, prevC: ${prevCard.display}, nCard: ${nextCard.display}`)
      const playerHasTrumpfbur = player.hand.find(c => c.value === 100) ? true : false
      return this.deck.validateCard(activeSuit, playerHasSuit, prevCard, nextCard, playerHasTrumpfbur)
    } else {
      return true
    }

  }
  getDeclaredWise(): WisInfo[] {
    return this.wishander.getDeclareList().map(e => {
      e.playerPlace = this.getPlayer(e.playerId).place
      return e
    })
  }
  validWis(playerId: string, declares: WisDeclare[]): boolean {
    //if (!this.settings.enableWise) return false
    const team = this.getPlayerTeam(this.getPlayer(playerId))
    return this.wishander.declareWis(playerId, team, declares)
  }
  finishWise(): void {
    
    //1. ATTENTION: This also removes wisInfo for all not winning players
    const wisResult = this.wishander.getWisWinScore()
    if(!wisResult) return

    //2. Send wis winlist to clients until next turn starts, for info
    const winlist = this.wishander.getWinList().map(e => {
      e.playerPlace = this.getPlayer(e.playerId).place
      return e
    })

    //3. Clear rest of wise for next round
    this.wishander.clearWislist()

    if (wisResult.team === Team.TeamA) {
      this.tempWisScore.teamA = wisResult.amount
    } else {
      this.tempWisScore.teamB = wisResult.amount
    }

    this.io.to(this.roomKey).emit("wiswin", winlist, { teamA: this.tempWisScore.teamA, teamB: this.tempWisScore.teamB })
    
    this.isGameFinished()
  }
  setStoeckPlayer(p: Player, type: DeckType): void {
    if (type === DeckType.TRUMPF_CLUB) {
      if (p.hand.find(c => c.display === "club_queen") && p.hand.find(c => c.display === "club_king")) {
        this.stoeckPlayer = p.socket.id
      }
    } else if (type === DeckType.TRUMPF_DIAMOND) {
      if (p.hand.find(c => c.display === "diamond_queen") && p.hand.find(c => c.display === "diamond_king")) {
        this.stoeckPlayer = p.socket.id
      }
    } else if (type === DeckType.TRUMPF_HEART) {
      if (p.hand.find(c => c.display === "heart_queen") && p.hand.find(c => c.display === "heart_king")) {
        this.stoeckPlayer = p.socket.id
      }
    } else if (type === DeckType.TRUMPF_SPADE) {
      if (p.hand.find(c => c.display === "spade_queen") && p.hand.find(c => c.display === "spade_king")) {
        this.stoeckPlayer = p.socket.id
      }
    }
  }
  addStoeck(playerId: string): boolean {
    if (this.stoeckPlayer === playerId) {
      if (this.getPlayerTeam(this.getPlayer(playerId)) === Team.TeamA) {
        this.score.teamA = this.score.teamA + 20
      } else {
        this.score.teamB = this.score.teamB + 20
      }
      this.isGameFinished()
      return true
    }
    return false
  }
  playCard(cid: number, pid: string): void {
    //Remove played card from player hand
    this.getPlayer(pid).hand = this.getPlayer(pid).hand.filter(c => c.id !== cid)
    //Add card to stich
    const card = this.deck.getCardById(cid)
    this.getCurrentStich().push({ card: card, playerId: pid })
  }
  setPlayerTurn(place: number): void {
    this.getPlayers().forEach(p => {
      p.place == place ? p.shouldPlay = true : p.shouldPlay = false
    })
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
  getPlayerByPlace(place: number): Player {
    return this.getPlayers().find(p => p.place === place)
  }
  getPlayerTeam(player: Player): Team {
    if (player.place === 1 || player.place === 3) return Team.TeamB
    else return Team.TeamA
  }
  getPlayerTeammate(place: number): Player {
    switch (place) {
      case 0:
        return this.getPlayerByPlace(2)
      case 1:
        return this.getPlayerByPlace(3)
      case 2:
        return this.getPlayerByPlace(0)
      case 3:
        return this.getPlayerByPlace(1)
    }
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

export { GAMES, Game, PlayedCard }