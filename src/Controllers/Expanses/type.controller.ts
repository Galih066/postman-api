import { Request, Response } from "express";
import * as TypeSvc from "../../Services/Expanses/type.services.js"

export const addType = async (req: Request, res: Response) => {
    const reqHeader = req.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const reqData = req.body;
    const data = await TypeSvc.handleAddCategory(reqData, token);
    res.status(data.statusCode).json(data);
}

export const getType = async (req: Request, res: Response) => {
    const reqHeader = req.headers.authorization;
    const token = reqHeader?.split(' ')[1] as string
    const data = await TypeSvc.handleAllType(token);
    res.status(data.statusCode).json(data);
}