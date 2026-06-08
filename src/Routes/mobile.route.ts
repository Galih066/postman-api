import { Router } from "express";
import { dailyExpanses, mobileDashboard } from "../Validations/expanses.validation.js";
import validation from "../Middlewares/validation.middleware.js";
import tokenValidation from "../Middlewares/auth.middleware.js";
import * as MobileController from "../Controllers/Expanses/mobile.controller.js";

const router = Router();

router.get('/date-range', [tokenValidation, validation(dailyExpanses, 'query')], MobileController.dateRangeExpanses)
router.get('/dashboard', [tokenValidation], MobileController.dashboard)
router.get('/transactions', [tokenValidation, validation(mobileDashboard, 'query')], MobileController.transactions)
router.get('/monthly-report', [tokenValidation, validation(mobileDashboard, 'query')], MobileController.monthlyReport)

export default router