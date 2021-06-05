import NodeCache from "node-cache"
export default class MemoryStore {
  cache: NodeCache
  constructor() {
    this.cache = new NodeCache()
  }

  get(key: string): any {
    return this.cache.get(key)
  }

  save(key: string, payload: any): void {
    this.cache.set(key, payload)
  }

}