import { Request, Response } from "express";
import * as ExpanseSvc from "../../Services/Expanses/daily.services.js"
import {
    GetDailyExpIntfc,
    GetIncomeIntfc,
    ExpansesListPaginationIntfc
} from "../../Interfaces/expanses.interface.js";

export const addDaily = async (req: Request, res: Response) => {
    const reqHeader = req.headers.authorization;
    const reqData = req.body;
    const token = reqHeader?.split(' ')[1] as string
    const data = await ExpanseSvc.handleDailyExpanses(reqData, token);
    res.status(data.statusCode).json(data);
}

export const getDaily = async (req: Request, res: Response) => {
    const reqHeader = req.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const { start, end, tz } = req.query as unknown as GetDailyExpIntfc;
    const data = await ExpanseSvc.getDailyExpanses({ start, end, tz }, token);
    res.status(data.statusCode).json(data);
}

export const getNonDaily = async (req: Request, res: Response) => {
    const reqHeader = req.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const { start, end, tz } = req.query as unknown as GetDailyExpIntfc;
    const data = await ExpanseSvc.getNonDailyExpanses({ start, end, tz }, token);
    res.status(data.statusCode).json(data);
}

export const getSummary = async (req: Request, res: Response) => {
    const reqHeader = req.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const { start, end, tz } = req.query as unknown as GetDailyExpIntfc;
    const data = await ExpanseSvc.getSummaryExpanses({ start, end, tz }, token);
    res.status(data.statusCode).json(data);
}

export const dailyChart = async (req: Request, res: Response) => {
    const { month, year, tz } = req.query as unknown as GetIncomeIntfc;
    const data = await ExpanseSvc.getDailyChart({ month, year, tz });
    res.status(data.statusCode).json(data);
}

export const summAnalythic = async (req: Request, res: Response) => {
    const { month, year, tz } = req.query as unknown as GetIncomeIntfc;
    const data = await ExpanseSvc.getSummaryAnalysis({ month, year, tz });
    res.status(data.statusCode).json(data);
}

export const dailyList = async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as ExpansesListPaginationIntfc
    const data = await ExpanseSvc.getExpansesList(page, limit);
    res.status(data.statusCode).json(data);
}

export const monthlySummary = async (req: Request, res: Response) => {
    const data = await ExpanseSvc.getMonthlySummary(req.query);
    res.status(data.statusCode).json(data);
}