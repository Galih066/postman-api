import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY as string

const tokenValidation = (req: Request, res: Response, next: NextFunction) => {
    const rawToken = req.headers.authorization

    if (!rawToken || !rawToken.toLowerCase().startsWith('bearer')) {
        res.status(403).json({
            status: 403,
            message: 'Forbidden',
            details: 'No token provided',
        })

        return
    }

    const token = rawToken?.split(' ')[1]

    try {
        const payload = jwt.verify(token, secretKey) as { context: string, iat: number }
        req.context = payload.context
        next()
    } catch (error) {
        res.status(403).json({
            status: 403,
            message: 'Forbidden',
            details: 'Invalid token',
        })
    }
}

export default tokenValidation