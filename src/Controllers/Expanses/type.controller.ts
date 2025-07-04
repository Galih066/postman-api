import { Request, Response } from "express";
import * as TypeSvc from "../../Services/Expanses/type.services.js"

export const addType = async (req: Request, res: Response) => {
    const reqData = req.body;
    const data = await TypeSvc.handleAddCategory(reqData);
    res.status(data.statusCode).json(data);
}

export const getType = async (req: Request, res: Response) => {
    const data = await TypeSvc.handleAllType();
    res.status(data.statusCode).json(data);
}