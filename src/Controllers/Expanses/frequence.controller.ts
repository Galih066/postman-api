import { Request, Response } from "express";
import * as FreqSvc from "../../Services/Expanses/frequence.services.js"

export const allFreq = async (req: Request, res: Response) => {
    const reqHeader = req.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const data = await FreqSvc.getAllFrequence(token);
    res.status(data.statusCode).json(data);
}

export const addFreq = async (req: Request, res: Response) => {
    const reqData = req.body;
    const reqHeader = req.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const data = await FreqSvc.handleAddFrequences(reqData, token);
    res.status(data.statusCode).json(data);
}