import { Request, Response } from "express"
import * as AuthServices from "../../Services/User/auth.services.js"
import { UserIntfc } from "../../Interfaces/user.interface.js";

export const login = async (req: Request, res: Response): Promise<void> => {
    const reqData = req.body;
    const result = await AuthServices.handleLogin(reqData);
    res.status(result.statusCode).json(result);
}

export const register = async (req: Request, res: Response): Promise<void> => {
    const reqData = req.body;
    const result = await AuthServices.handleRegister(reqData);
    res.status(result.statusCode).json(result);
}

export const user = async (req: Request, res: Response): Promise<void> => {
    const reqData = req.query as unknown as UserIntfc;
    const result = await AuthServices.getUser(reqData);
    res.status(result.statusCode).json(result);
}