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
const suits = ["heart", "diamond", "spade", "club"] as const
type Suit = typeof suits[number]


enum DeckType {
  UPDOWN,
  DOWNUP,
  SLALOM_UP,
  SLALOM_DOWN,
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
  validateCard(activeSuit: Suit, playerHasSuit: boolean, prev: Card, next: Card, playerHasTrumpfbur: boolean): boolean {
    if (playerHasSuit && next.suit !== activeSuit) return false
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
    this.addCards(CARDS)
    this.setCardScores()
  }
  addCards(ca: string[]): void {
    suits.forEach((s, si) => {
      ca.forEach((c, i) => {
        this.cards.push({ id: (si * 10) + i + 1, display: `${s}_${c}`, suit: s, value: 9 - i, score: 0 })
      })
    })
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

class SlamomDeck extends Deck {
  isUp = true
  currentWayUp = true
  constructor(isUp: boolean) {
    super()
    this.isUp = isUp
  }
  buildDeck() {
    this.addCards(CARDS)
    this.setCardScores()
  }
  addCards(ca: string[]): void {
    suits.forEach((s, si) => {
      ca.forEach((c, i) => {
        let val = i + 1
        if (!this.isUp) val = 9 - i
        this.cards.push({ id: (si * 10) + i + 1, display: `${s}_${c}`, suit: s, value: val, score: 0 })
      })
    })
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
    let winId = stich[0].card.id
    let maxVal = stich[0].card.value
    stich.forEach((c, i) => {
      if (i === 0) return
      let winCheck = c.card.value > maxVal
      if (!this.currentWayUp) {
        winCheck = c.card.value < maxVal
      }
      if (winCheck && c.card.suit === stich[0].card.suit) {
        winId = c.card.id
        maxVal = c.card.value
      }
    })
    this.currentWayUp = !this.currentWayUp
    return winId
  }
}

class TrumpfDeck extends Deck {
  trumpf: Suit
  constructor(type: Suit) {
    super()
    this.trumpf = type
  }
  buildDeck(): void {
    suits.forEach((s, si) => {
      CARDS.forEach((c, i) => {
        let val = i + 1
        if (s === this.trumpf) {
          val = 20 + i + 1
          if (c === "jack") val = 100
          if (c === "9") val = 50
        }
        this.cards.push({ id: (si * 10) + i + 1, display: `${s}_${c}`, suit: s, value: val, score: 0 })
      })
    })
    this.setCardScores()
  }
  setCardScores(): void {
    this.cards.forEach(c => {
      switch (c.value) {
        case 100:
          c.score = 20
          break
        case 50:
          c.score = 14
          break
        case 9:
        case 29:

          c.score = 11
          break
        case 8:
        case 28:
          c.score = 4
          break
        case 7:
        case 27:
          c.score = 3
          break
        case 6:
          c.score = 2
          break
        case 5:
        case 25:
          c.score = 10
          break
        default:
          c.score = 0
          break
      }
    })
    console.log(this.cards)
  }
  validateCard(activeSuit: Suit, playerHasSuit: boolean, prev: Card, next: Card, playerHasTrumpfbur: boolean): boolean {
    if (activeSuit === this.trumpf) {
      if ((playerHasSuit && next.suit !== activeSuit) && !playerHasTrumpfbur) return false
    } else {
      const playedLowerTrumpf = false
      if ((playerHasSuit && next.suit !== activeSuit) && (next.suit !== this.trumpf && !playedLowerTrumpf)) return false
    }
    return true
  }
  getStichWin(stich: PlayedCard[]): number {
    let winId = stich[0].card.id
    let maxVal = stich[0].card.value
    stich.forEach((c, i) => {
      if (i === 0) return
      if (c.card.value > maxVal && (c.card.suit === stich[0].card.suit || c.card.suit === this.trumpf)) {
        winId = c.card.id
        maxVal = c.card.value
      }
    })
    return winId
  }
}

function deckFactory(type: DeckType): Deck {
  switch (type) {
    case DeckType.UPDOWN:
      return new UpdownDeck()
    case DeckType.DOWNUP:
      return new DownupDeck()
    case DeckType.SLALOM_UP:
      return new SlamomDeck(true)
    case DeckType.SLALOM_DOWN:
      return new SlamomDeck(false)
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