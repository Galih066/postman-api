import { Request, Response } from "express"
import * as AuthServices from "../../Services/User/auth.services.js"

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
    const reqData = req.context
    const result = await AuthServices.getUser(reqData);
    res.status(result.statusCode).json(result);
}

export const addProfile = async (req: Request, res: Response): Promise<void> => {
    const reqData = req.body
    const headerData = req.headers.authorization
    const token = headerData?.split(' ')[1]
    const allReq = { ...reqData, userId: token }
    const result = await AuthServices.addNewProfile(allReq);
    res.status(result.statusCode).json(result);
}

export const editProfile = async (req: Request, res: Response): Promise<void> => {
    const reqData = req.body
    const headerData = req.headers.authorization
    const token = headerData?.split(' ')[1]
    const allReq = { ...reqData, userId: token }
    // res.status(result.statusCode).json(result);
}