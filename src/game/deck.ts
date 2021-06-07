import { PlayedCard } from "./game"

const chunk = <Type>(input: Array<Type>, size: number): Array<Array<Type>> => {
  return input.reduce((arr, item, idx) => {
    return idx % size === 0
      ? [...arr, [item]]
      : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]]
  }, [])
}

const shuffle = <Type>(array: Array<Type>): Array<Type> => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
const CARDS = ["6", "7", "8", "9", "10", "jack", "queen", "king", "1"]
const TCARDS = ["6", "7", "8", "10", "queen", "king", "1", "9", "jack"]
const suits = ["heart", "diamond", "spade", "club"] as const
type Suit = typeof suits[number]


enum DeckType {
  UPDOWN,
  DOWNUP,
  SLALOM,
  TRUMPF_HEART,
  TRUMPF_DIAMOND,
  TRUMPF_SPADE,
  TRUMPF_CLUB,
}

interface Card {
  id: number
  display: string
  value: number
  score: number
  suit: Suit
}

abstract class Deck {
  cards: Card[] = []
  distribute(): Array<Card[]> {
    if (!this.cards || this.cards.length <= 0) {
      throw "MISSING CARDS; DECK INIT FAILED"
    }
    return chunk(shuffle(this.cards), 9)
  }
  addCards(ca: string[]): void {
    suits.forEach((s, si) => {
      ca.forEach((c, i) => {
        this.cards.push({ id: (si * 10) + i + 1, display: `${s}_${c}`, suit: s, value: i + 1, score: 0 })
      })
    })
  }
  getCardById(id: number): Card {
    return this.cards.find(c => c.id == id)
  }
  getCardValueById(id: number): number {
    return this.cards.find(c => c.id == id).value
  }
  validateCard(activeSuit: Suit, playerHasSuit: boolean, prev: Card, next: Card): boolean {
    if (playerHasSuit && next.suit !== prev.suit) return false
    return true
  }
  abstract buildDeck(): void
  abstract setCardScores(): void
  abstract getStichWin(stich: PlayedCard[]): number
}

class UpdownDeck extends Deck {
  constructor() {
    super()
  }
  buildDeck() {
    this.addCards(CARDS)
    this.setCardScores()
  }
  setCardScores() {
    this.cards.forEach(c => {
      switch (c.value) {
        case 9:
          c.score = 11
          break
        case 8:
          c.score = 4
          break
        case 7:
          c.score = 3
          break
        case 6:
          c.score = 2
          break
        case 5:
          c.score = 10
          break
        case 3:
          c.score = 8
          break
        default:
          break
      }
    })
  }
  getStichWin(stich: PlayedCard[]): number {
    //TODO: This can be abstraceted for use in all non trumpf decks
    let winId = stich[0].card.id
    let maxVal = stich[0].card.value
    stich.forEach((c, i) => {
      if (i === 0) return
      if (c.card.value > maxVal && c.card.suit === stich[0].card.suit) {
        winId = c.card.id
        maxVal = c.card.value
      }
    })
    return winId
  }
}


class DownupDeck extends Deck {
  constructor() {
    super()
  }
  buildDeck() {
    this.addCards(CARDS.reverse())
    this.setCardScores()
  }
  setCardScores() {
    this.cards.forEach(c => {
      switch (c.value) {
        case 9:
          c.score = 11
          break
        case 7:
          c.score = 8
          break
        case 5:
          c.score = 10
          break
        case 4:
          c.score = 2
          break
        case 3:
          c.score = 3
          break
        case 2:
          c.score = 4
          break
        default:
          break
      }
    })
  }
  getStichWin(stich: PlayedCard[]): number {
    throw new Error("Method not implemented.")
  }
}

class SlamomDeck extends UpdownDeck {
  isUp = true
  currentWayUp = true
  constructor() {
    super()
  }
  setCardScores() {
    if (this.isUp) {
      this.cards.forEach(c => {
        switch (c.value) {
          case 9:
            c.score = 11
            break
          case 8:
            c.score = 4
            break
          case 7:
            c.score = 3
            break
          case 6:
            c.score = 2
            break
          case 5:
            c.score = 10
            break
          case 3:
            c.score = 8
            break
          default:
            break
        }
      })
    } else {
      this.cards.forEach(c => {
        switch (c.value) {
          case 9:
            c.score = 11
            break
          case 7:
            c.score = 8
            break
          case 5:
            c.score = 10
            break
          case 4:
            c.score = 2
            break
          case 3:
            c.score = 3
            break
          case 2:
            c.score = 4
            break
          default:
            break
        }
      })
    }
  }
  getStichWin(stich: PlayedCard[]): number {
    throw new Error("Method not implemented.")
  }
}

class TrumpfDeck extends Deck {
  trumpf: Suit
  constructor(type: Suit) {
    super()
    this.trumpf = type
  }
  buildDeck() {
    suits.forEach((s, si) => {
      let lc = CARDS
      let tBonus = 0
      if (s === this.trumpf) {
        lc = TCARDS
        tBonus = 10
      }
      lc.forEach((c, i) => {
        this.cards.push({ id: (si * 10) + i + 1, display: `${s}_${c}`, suit: s, value: (tBonus + i + 1), score: 0 })
      })
    })
  }
  setCardScores() {
    this.cards.forEach(c => {
      switch (c.value) {
        case 9:
          c.score = 11
          break
        case 8:
          c.score = 4
          break
        case 7:
          c.score = 3
          break
        case 6:
          c.suit === this.trumpf ? c.score = 20 : 2
          break
        case 5:
          c.score = 10
          break
        case 4:
          c.suit === this.trumpf ? c.score = 14 : 0
          break
        default:
          break
      }
    })
  }
  validateCard(activeSuit: Suit, playerHasSuit: boolean, prev: Card, next: Card): boolean {
    if (playerHasSuit && next.suit !== prev.suit) {
      if (next.suit !== this.trumpf) return false

    }
    return true
  }
  getStichWin(stich: PlayedCard[]): number {
    throw new Error("Method not implemented.")
  }
}

function deckFactory(type: DeckType): Deck {
  switch (type) {
    case DeckType.UPDOWN:
      return new UpdownDeck()
    case DeckType.DOWNUP:
      return new DownupDeck()
    case DeckType.SLALOM:
      return new SlamomDeck()
    case DeckType.TRUMPF_HEART:
      return new TrumpfDeck("heart")
    case DeckType.TRUMPF_DIAMOND:
      return new TrumpfDeck("diamond")
    case DeckType.TRUMPF_SPADE:
      return new TrumpfDeck("spade")
    case DeckType.TRUMPF_CLUB:
      return new TrumpfDeck("club")
  }
}

export { Card, Deck, DeckType, deckFactory }