import { Request, Response } from "express";

export const getAll = (req: Request, res: Response) => {
  //Enable for cache testing
  /*const res = await <MODEL>.findAll({});*/
  res.status(200);
}