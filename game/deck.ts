
const chunk = (input, size) => {
  return input.reduce((arr, item, idx) => {
    return idx % size === 0
      ? [...arr, [item]]
      : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, []);
};

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array
}

const CARDS = ['6', '7', '8', '9', '10', 'jack', 'queen', 'king', '1']
const TCARDS = ['6', '7', '8', '10', 'queen', 'king', '1', '9', 'jack']
const suits = ['heart', 'diamond', 'spade', 'club'] as const
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
  suit: Suit
}

abstract class Deck {
  cards: Card[] = []
  constructor() {
  }
  distribute(): Array<Card[]> {
    if (!this.cards || this.cards.length <= 0) {
      throw "MISSING CARDS; DECK INIT FAILED"
    }
    return chunk(shuffle(this.cards), 9)
  }
  addCards(ca: string[]) {
    suits.forEach((s, si) => {
      ca.forEach((c, i) => {
        this.cards.push({ id: (si * 10) + i + 1, display: `${s}_${c}`, suit: s, value: i + 1 })
      })
    })
  }
  abstract buildDeck(): void
}

class UpdownDeck extends Deck {
  constructor() {
    super()
  }
  buildDeck() {
    this.addCards(CARDS);
  }
}


class DownupDeck extends Deck {
  constructor() {
    super()
  }
  buildDeck() {
    this.addCards(CARDS.reverse());
  }
}

class SlamomDeck extends UpdownDeck {
  isUp: boolean = true
  constructor() {
    super()
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
        this.cards.push({ id: (si * 10) + i + 1, display: `${s}_${c}`, suit: s, value: (tBonus + i + 1) })
      })
    })
  }
}

function deckFactory(type: DeckType): Deck {
  switch (type) {
    case DeckType.UPDOWN:
      return new UpdownDeck();
    case DeckType.DOWNUP:
      return new DownupDeck();
    case DeckType.SLALOM:
      return new SlamomDeck();
    case DeckType.TRUMPF_HEART:
      return new TrumpfDeck('heart');
    case DeckType.TRUMPF_DIAMOND:
      return new TrumpfDeck('diamond');
    case DeckType.TRUMPF_SPADE:
      return new TrumpfDeck('spade');
    case DeckType.TRUMPF_CLUB:
      return new TrumpfDeck('club');
  }
}

export { Card, Deck, DeckType, deckFactory }