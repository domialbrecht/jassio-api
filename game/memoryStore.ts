import NodeCache from "node-cache"
export default class MemoryStore {
  cache: NodeCache
  constructor() {
    this.cache = new NodeCache();
  }

  get(key) {
    return this.cache.get(key);
  }

  save(key, payload) {
    this.cache.set(key, payload);
  }

}