import { Card } from "./deck"
import { Team } from "./game"

export enum WisType {
  BLATT = "blatt",
  STOECK = "stoeck",
  SIMILAR = "similar",
}

export type WisInfo = {
  playerId: string
  playerPlace: number
  highestWisValue: number
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
    switch (this.cards.length) {
      case 3:
        this.score = 20
        this.value = 10
        break
      case 4:
        this.score = 50
        this.value = 20
        break
      case 5:
        this.score = 100
        this.value = 30
        break
      case 6:
        this.score = 150
        this.value = 40
        break
      case 7:
        this.score = 200
        this.value = 50
        break
      case 8:
        this.score = 250
        this.value = 60
        break
      case 9:
        this.score = 300
        this.value = 70
        break
      default:
        this.score = 0
        this.value = 0
        break
    }
  }

}
function validateBlattWis(cards: Card[]) {
  return true
  return cards.sort((c1, c2) => c1.id - c2.id)
    .every((card, i) => i === 0 || cards[i - 1].id + 1 === card.id)
}

class StoeckWis extends Wis {
  numerateWis(): void {
    this.score = 20
    this.value = 20
  }
}
function validateStoeckWis(cards: Card[]) {
  return true
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
  declareWis(playerId: string, team: Team, cards: Card[], wisType: WisType): boolean {
    //TODO: Add validation for submitting same cards mutliple times
    switch (wisType) {
      case WisType.BLATT:
        if (validateBlattWis(cards)) {
          this.addWis(playerId, team, new BlattWis(cards))
          return true
        }
        return false
      case WisType.STOECK:
        if (validateStoeckWis(cards)) {
          this.addWis(playerId, team, new StoeckWis(cards))
          return true
        }
        return false
      case WisType.SIMILAR:
        if (validateSimilarWis(cards)) {
          this.addWis(playerId, team, new SimilarWis(cards))
          return true
        }
        return false
      default:
        return false
    }
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
      out.push({ playerId: key, playerPlace: 99, highestWisValue: highestVal.score })
    })
    return out
  }
  getWisWinScore(): { team: Team, amount: number } {
    let v: number
    let id: string
    let score = 0

    //Get highest overall wis, store player id
    this.playerWisList.forEach((value, key) => {
      const highestVal = value.wise.sort((a, b) => a.score - b.score)[value.wise.length - 1]
      if (!v || highestVal.score > v) {
        v = highestVal.score
        id = key
      }
    })

    //Get winning team
    const winnerTeam = this.playerWisList.get(id).playerTeam
    //Sumup winner player scores
    this.playerWisList.get(id).wise.forEach((value) => {
      score += value.score
    })
    //Sumup teammate scores
    this.playerWisList.forEach((value, key) => {
      if (key !== id && value.playerTeam === winnerTeam) {
        value.wise.forEach((value) => {
          score += value.score
        })
      }
    })

    return { team: winnerTeam, amount: score }
  }
}

export { WisHandler }