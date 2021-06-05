import flatCache from "flat-cache"
import path from "path"
import { Game } from "./game"
const duration = 1000 * 60 * 60 * 24
//const autosaveInterval = 1000 * 60 * 5

class GameStore {
  cache: flatCache.Cache;
  constructor() {
    this.cache = flatCache.load(path.join(`${__dirname}/../cache/gameCache`))
  }
  getKey(key: string): void {
    const now = new Date().getTime()
    const value = this.cache.getKey(key)
    if (value === undefined || value.expire < now) {
      return undefined
    } else {
      return value.data
    }
  }
  setKey(key: string, value: any): void {
    const now = new Date().getTime()
    this.cache.setKey(key, {
      expire: now + duration,
      data: value,
    })
  }
  //setupAutosave = () => { }
  saveGame(game: Game): void {
    game.serialize()
  }
}

export { GameStore }
