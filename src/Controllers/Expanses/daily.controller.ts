import { Request, Response } from "express";
import * as ExpanseSvc from "../../Services/Expanses/daily.services.js"

export const addDaily = async (req: Request, res: Response) => {
    const reqData = req.body;
    const data = await ExpanseSvc.handleDailyExpanses(reqData);
    res.status(data.statusCode).json(data);
}