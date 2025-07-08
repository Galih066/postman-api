import { Request, Response } from "express";
import * as IncomeService from "../../Services/Expanses/income.service.js";

export const addUserIncome = async (req: Request, res: Response) => {
    const reqData = req.body;
    const data = await IncomeService.addIncome(reqData);
    res.status(data.statusCode).json(data);
}