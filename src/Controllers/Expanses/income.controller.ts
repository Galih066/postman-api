import { Request, Response } from "express";
import * as IncomeService from "../../Services/Expanses/income.services.js";
import { GetIncomeIntfc } from "../../Interfaces/expanses.interface.js";

export const addUserIncome = async (req: Request, res: Response) => {
    const reqHeader = req.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const reqData = req.body;
    const data = await IncomeService.addIncome(reqData, token);
    res.status(data.statusCode).json(data);
}

export const getUserIncome = async (req: Request, res: Response) => {
    const reqHeader = req.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const reqData = req.query as unknown as GetIncomeIntfc;
    const data = await IncomeService.getIncome(reqData, token);
    res.status(data.statusCode).json(data);
}

export const getAllUserIncome = async (req: Request, res: Response) => {
    const reqHeader = req.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const data = await IncomeService.getAllIncome(token);
    res.status(data.statusCode).json(data);
}

export const addDefaultIncomeUser = async (req: Request, res: Response) => {
    const data = await IncomeService.addDefaultIncome()
    res.status(data.statusCode).json(data);
}