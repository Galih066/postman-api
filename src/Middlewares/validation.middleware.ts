import { Request, Response, NextFunction } from "express";
import Joi from "joi";

interface ValidationMiddleware {
    (req: Request, res: Response, next: NextFunction): void;
}

const validation = (schema: Joi.ObjectSchema<any>, reqMethod: string): ValidationMiddleware => {
    return (req: Request, res: Response, next: NextFunction): void => {
        let reqData = req.body;
        if (reqMethod === 'query') reqData = req.query;
        const { error, value } = schema.validate(reqData, { abortEarly: false });

        if (error) {
            res.status(400).json({
                statusCode: 400,
                message: 'Validation error',
                details: error.details.map(d => d.message),
            });
            return;
        }

        req.body = value;
        next();
    };
};

export default validation;