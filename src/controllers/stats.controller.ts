import { Request, Response } from "express"
import prisma from "../client"

export const getAll = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany()
  res.json(users)
}

export const getGames = async (_req: Request, res: Response) => {
  const games = await prisma.game.findMany()
  res.json(games)
}