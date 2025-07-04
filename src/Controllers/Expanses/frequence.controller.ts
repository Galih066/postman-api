import { Request, Response } from "express";
import * as FreqSvc from "../../Services/Expanses/frequence.services.js"

export const allFreq = async (req: Request, res: Response) => {
    const data = await FreqSvc.getAllFrequence();
    res.status(data.statusCode).json(data);
}