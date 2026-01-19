import { Request, Response } from "express";
import * as IncomeService from "../../Services/Expanses/income.services.js";
import { GetIncomeIntfc } from "../../Interfaces/expanses.interface.js";

export const addUserIncome = async (req: Request, res: Response) => {
    const reqData = req.body;
    const data = await IncomeService.addIncome(reqData);
    res.status(data.statusCode).json(data);
}

export const getUserIncome = async (req: Request, res: Response) => {
    const reqData = req.query as unknown as GetIncomeIntfc;
    const data = await IncomeService.getIncome(reqData);
    res.status(data.statusCode).json(data);
}

export const addDefaultIncomeUser = async (req: Request, res: Response) => {
    const data = await IncomeService.addDefaultIncome()
    res.status(data.statusCode).json(data);
}