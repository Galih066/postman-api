import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY as string

const tokenValidation = (req: Request, res: Response, next: NextFunction) => {
    const rawToken = req.headers.authorization

    if (!rawToken || !rawToken.toLowerCase().startsWith('bearer')) {
        return res.status(403).json({
            status: 403,
            message: 'Forbidden',
            details: 'No token provided',
        })
    }

    const token = rawToken?.split(' ')[1]

    try {
        const payload = jwt.verify(token, secretKey) as { context: string, iat: number }
        req.context = payload.context
    } catch (error) {
        return res.status(403).json({
            status: 403,
            message: 'Forbidden',
            details: 'Invalid token',
        })
    }

    next()
}

export default tokenValidation