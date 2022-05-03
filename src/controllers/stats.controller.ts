import { Request, Response } from "express"
import prisma from "../client"

export const getAll = async (_req: Request, res: Response) => {
  const games = await prisma.game.findMany()
  const gameInfo = {
    amount: games.length,
    burewis: 0,
    streak: {
      name: "-",
      value: 0,
    }
  }
  res.json(gameInfo)
}

export const getGames = async (_req: Request, res: Response) => {
  const games = await prisma.game.findMany()
  const gameInfo = {
    "amount": games.length
  }
  res.json(gameInfo)
}