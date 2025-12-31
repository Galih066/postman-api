import { Request, Response } from "express";
import * as MobileService from "../../Services/Expanses/mobile.services.js";
import { GetDailyExpIntfc } from "../../Interfaces/expanses.interface.js";

export const dateRangeExpanses = async (request: Request, response: Response) => {
    const reqHeader = request.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const reqData = request.query as unknown as GetDailyExpIntfc
    const result = await MobileService.handleDateRangeMobile(reqData, token)
    response.status(result.statusCode).json(result)
}