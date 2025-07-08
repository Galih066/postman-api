import { Request, Response } from "express";
import * as ExpanseSvc from "../../Services/Expanses/daily.services.js"
import { GetDailyExpIntfc } from "../../Interfaces/expanses.interface.js";

export const addDaily = async (req: Request, res: Response) => {
    const reqData = req.body;
    const data = await ExpanseSvc.handleDailyExpanses(reqData);
    res.status(data.statusCode).json(data);
}

export const getDaily = async (req: Request, res: Response) => {
    const { start, end } = req.query as unknown as GetDailyExpIntfc;
    const data = await ExpanseSvc.getDailyExpanses({ start, end });
    res.status(data.statusCode).json(data);
}

export const getSummary = async (req: Request, res: Response) => {
    const { start, end } = req.query as unknown as GetDailyExpIntfc;
    const data = await ExpanseSvc.getSummaryExpanses({ start, end });
    res.status(data.statusCode).json(data);
}