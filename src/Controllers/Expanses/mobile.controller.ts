import { Request, Response } from "express";
import * as MobileService from "../../Services/Expanses/mobile.services.js";
import * as IncomeService from "../../Services/Expanses/income.services.js";
import { GetDailyExpIntfc, GetIncomeIntfc, AddIncomeIntfc } from "../../Interfaces/expanses.interface.js";

export const dateRangeExpanses = async (request: Request, response: Response) => {
    const reqHeader = request.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const reqData = request.query as unknown as GetDailyExpIntfc
    const result = await MobileService.handleDateRangeMobile(reqData, token)
    response.status(result.statusCode).json(result)
}

export const dashboard = async (request: Request, response: Response) => {
    const reqHeader = request.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const result = await MobileService.handleDashboard(token)
    response.status(result.statusCode).json(result)
}

export const transactions = async (request: Request, response: Response) => {
    const reqHeader = request.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const reqData = request.query as unknown as GetIncomeIntfc
    const result = await MobileService.handleTransactions(reqData, token)
    response.status(result.statusCode).json(result)
}

export const monthlyReport = async (request: Request, response: Response) => {
    const reqHeader = request.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const reqData = request.query as unknown as GetIncomeIntfc
    const result = await MobileService.handleMonthlyReport(reqData, token)
    response.status(result.statusCode).json(result)
}

export const expanseDetail = async (request: Request, response: Response) => {
    const reqHeader = request.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const { id } = request.query as { id: string }
    const result = await MobileService.handleExpanseDetail(id, token)
    response.status(result.statusCode).json(result)
}

export const incomeList = async (request: Request, response: Response) => {
    const reqHeader = request.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const result = await MobileService.handleIncomeList(token)
    response.status(result.statusCode).json(result)
}

export const addIncome = async (request: Request, response: Response) => {
    const reqHeader = request.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const reqData = request.body as AddIncomeIntfc
    const result = await IncomeService.addIncome(reqData, token)
    response.status(result.statusCode).json(result)
}