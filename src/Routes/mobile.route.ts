import { Router } from "express";
import { dailyExpanses } from "../Validations/expanses.validation.js";
import validation from "../Middlewares/validation.middleware.js";
import tokenValidation from "../Middlewares/auth.middleware.js";
import * as MobileController from "../Controllers/Expanses/mobile.controller.js";

const router = Router();

router.get('/date-range', [tokenValidation, validation(dailyExpanses, 'query')], MobileController.dateRangeExpanses)

export default router