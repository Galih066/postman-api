import { Router } from "express";
import validation from "../Middlewares/validation.middleware.js";
import tokenValidation from "../Middlewares/auth.middleware.js";
import { dailyExpanses } from "../Validations/expanses.validation.js";

const router = Router();

router.get('/daily', [tokenValidation, validation(dailyExpanses, 'query')])

export default router