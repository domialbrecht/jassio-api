import { Card } from "./deck"
import { Team } from "./game"

export enum WisType {
  BLATT = "blatt",
  SIMILAR = "similar",
}

export type WisDeclare = {
  id: number
  type: WisType
  cards: Card[]
}

export type WisInfo = {
  playerId: string
  playerPlace: number
  wise: number[]
}

type WisEntry = {
  wise: Wis[]
  playerTeam: Team
}

abstract class Wis {
  value: number
  score: number
  cards: Card[]
  constructor(cards: Card[]) {
    this.cards = cards
    this.numerateWis()

  }
  abstract numerateWis(): void
}

class BlattWis extends Wis {
  numerateWis(): void {
    //In BlattWis, value is always depending on highest value card
    const sortedCards = this.cards.sort((c1, c2) => c1.value - c2.value)
    switch (this.cards.length) {
      case 3:
        this.score = 20
        this.value = sortedCards[sortedCards.length - 1].value * 100
        break
      case 4:
        this.score = 50
        this.value = sortedCards[sortedCards.length - 1].value * 200
        break
      case 5:
        this.score = 100
        this.value = sortedCards[sortedCards.length - 1].value * 300
        break
      case 6:
        this.score = 150
        this.value = sortedCards[sortedCards.length - 1].value * 400
        break
      case 7:
        this.score = 200
        this.value = sortedCards[sortedCards.length - 1].value * 500
        break
      case 8:
        this.score = 250
        this.value = sortedCards[sortedCards.length - 1].value * 600
        break
      case 9:
        this.score = 300
        this.value = sortedCards[sortedCards.length - 1].value * 700
        break
      default:
        this.score = 0
        this.value = 0
        break
    }
  }

}
function validateBlattWis(cards: Card[]) {
  return cards.sort((c1, c2) => c1.id - c2.id)
    .every((card, i) => i === 0 || cards[i - 1].id + 1 === card.id)
}

class SimilarWis extends Wis {
  numerateWis(): void {
    //From 4 similar cards, get one that is not trumpf to set value correctly
    const testCard = this.cards.sort((a, b) => a.value - b.value)[0]
    switch (testCard.display.split("_")[1]) {
      case "jack":
        this.score = 200
        this.value = 100
        break
      case "9":
        this.score = 150
        this.value = 99
        break
      default:
        this.score = 100
        this.value = testCard.value
        break
    }
  }
}
function validateSimilarWis(cards: Card[]) {
  return cards.every(c => c.display.split("_")[1] === cards[0].display.split("_")[1])
}

class WisHandler {
  playerWisList: Map<string, WisEntry>
  constructor() {
    this.playerWisList = new Map<string, WisEntry>()
  }
  declareWis(playerId: string, team: Team, declares: WisDeclare[]): boolean {
    let wiseValid = false

    //Player can declare wise only once
    if (this.playerWisList.get(playerId)) return false

    declares.forEach(wis => {
      let cardsUnused = true
      //If last wis in loop shared some cards, wis is invalid
      const playerWise = this.playerWisList.get(playerId) ? this.playerWisList.get(playerId).wise : undefined
      if (playerWise) {
        cardsUnused = playerWise.every(w => w.cards.every(c => wis.cards.some(cf => cf.id == c.id) === false))
      }
      switch (wis.type) {
        case WisType.BLATT:
          if (validateBlattWis(wis.cards)) {
            this.addWis(playerId, team, new BlattWis(wis.cards))
            wiseValid = cardsUnused ? true : false
          }
          break
        case WisType.SIMILAR:
          if (validateSimilarWis(wis.cards)) {
            this.addWis(playerId, team, new SimilarWis(wis.cards))
            wiseValid = cardsUnused ? true : false
          }
          break
        default:
          break
      }
    })
    return wiseValid
  }
  addWis(playerId: string, team: Team, wis: Wis): void {
    const wislit = this.playerWisList.get(playerId) ? this.playerWisList.get(playerId).wise : []
    wislit.push(wis)
    this.playerWisList.set(playerId, { playerTeam: team, wise: wislit })
  }
  getDeclareList(): WisInfo[] {
    const out: WisInfo[] = []
    this.playerWisList.forEach((value, key) => {
      const highestVal = value.wise.sort((a, b) => a.score - b.score)[value.wise.length - 1]
      out.push({ playerId: key, playerPlace: 99, wise: [highestVal.score] })
    })
    return out
  }
  getWinList(): WisInfo[] {
    const out: WisInfo[] = []
    this.playerWisList.forEach((value, key) => {
      const wl = value.wise.map(w => w.score)
      out.push({ playerId: key, playerPlace: 99, wise: wl })
    })
    return out
  }
  getWisWinScore(): { team: Team, amount: number } | undefined {
    let currentBestwis: Wis
    let id: string
    let score = 0

    if (this.playerWisList.size <= 0) return undefined

    //Get highest overall wis, store player id
    this.playerWisList.forEach((value, key) => {
      const playersBestWis = value.wise.sort((a, b) => a.score - b.score)[value.wise.length - 1]
      if (!currentBestwis || playersBestWis.score > currentBestwis.score) {
        currentBestwis = playersBestWis
        id = key
      } else if (playersBestWis.score === currentBestwis.score) {
        if (playersBestWis.value > currentBestwis.value) {
          currentBestwis = playersBestWis
          id = key
        }
      }
    })

    //Get winning team
    const winnerTeam = this.playerWisList.get(id).playerTeam
    //Sumup teammate scores
    this.playerWisList.forEach((value, key) => {
      if (value.playerTeam === winnerTeam) {
        value.wise.forEach((value) => {
          score += value.score
        })
      } else {
        //Remove wise from players of non-winning team
        this.playerWisList.delete(key)
      }
    })

    return { team: winnerTeam, amount: score }
  }

  clearWislist(): void {
    //Delete wise for next round
    this.playerWisList.clear()
  }
}

export { WisHandler }