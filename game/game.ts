import { Server, Socket } from "socket.io";
const GAMES: Map<string, Game> = new Map()

type GameSettings = {
  winAmount: number,
  enableWise: boolean,
}

class Game {
  roomKey: string
  game: Game
  settings: GameSettings
  players: Map<string, Socket> = new Map()
  constructor(key, host: Socket) {
    this.roomKey = key
    this.players.set(host.id, host)
    this.settings = { winAmount: 1000, enableWise: true }
  }
  getPlayers(): Socket[] {
    return Array.from(this.players.values());
  }
  addPlayer(player: Socket) {
    this.players.set(player.id, player)
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
  serialize = (): string => {
    return "string"
  }
}

export { GAMES, Game };