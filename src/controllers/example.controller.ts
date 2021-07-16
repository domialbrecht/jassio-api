import { Request, Response } from "express"

export const getAll = (req: Request, res: Response) => {
  //Router for testing sentry error
  throw new Error("My first Sentry error!")
  res.status(200)
}