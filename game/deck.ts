
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
}

const CARDS = ['6', '7', '8', '9', '10', 'jack', 'queen', 'king', '1']
const TCARDS = ['6', '7', '8', '10', 'queen', 'king', '1', '9', 'jack']

enum Suit {
  HEART = 'heart',
  DIAMOND = 'diamond',
  SPADE = 'spade',
  CLUB = 'club',
}

enum DeckType {
  UPDOWN = 1,
  DOWNUP = 2,
  SLALOM = 3,
  TRUMPF = 4
}

interface Card {
  id: number
  display: string
  value: number
  suit: Suit
}

abstract class Deck {
  cards: Card[]
  constructor() {
    this.deckBuilder()
  }
  distribute(): Array<Card[]> {
    let d = chunk(shuffle(this.cards), 4)
    return d
  }
  abstract deckBuilder(): void
}

class UpdownDeck extends Deck {
  constructor() {
    super()
  }
  deckBuilder() {
    for (const suit in [Suit.HEART, Suit.DIAMOND, Suit.SPADE, Suit.CLUB]) {
      CARDS.forEach((c, i) => {
        this.cards.push({ id: i + 1, display: `${suit}_${c}`, suit: Suit[suit], value: i + 1 })
      })
    }
  }
}

class DownupDeck extends Deck {
  constructor() {
    super()
  }
  deckBuilder() {
    for (const suit in [Suit.HEART, Suit.DIAMOND, Suit.SPADE, Suit.CLUB]) {
      CARDS.forEach((c, i) => {
        this.cards.push({ id: i + 1, display: `${suit}_${c}`, suit: Suit[suit], value: 10 - (i + 1) })
      })
    }
  }
}

class SlamomDeck extends UpdownDeck {
  isUp: boolean = true
  constructor() {
    super()
  }
}

class TrumpfDeck extends Deck {
  trumpf: Suit = Suit.HEART
  constructor() {
    super()
  }
  deckBuilder() {
    for (const suit in [Suit.HEART, Suit.DIAMOND, Suit.SPADE, Suit.CLUB]) {
      let lc = CARDS
      if (suit === this.trumpf) {
        lc = TCARDS
      }
      lc.forEach((c, i) => {
        this.cards.push({ id: i + 1, display: `${suit}_${c}`, suit: Suit[suit], value: 10 - (i + 1) })
      })
    }
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
    case DeckType.TRUMPF:
      return new TrumpfDeck();
  }
}

export { Card, Deck, DeckType, deckFactory }