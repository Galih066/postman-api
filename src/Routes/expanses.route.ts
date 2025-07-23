import { Router } from "express";
import * as ExpansesController from "../Controllers/Expanses/daily.controller.js";
import * as TypeController from "../Controllers/Expanses/type.controller.js";
import * as FreqController from "../Controllers/Expanses/frequence.controller.js";
import * as IncomeController from "../Controllers/Expanses/income.controller.js";
import validation from "../Middlewares/validation.middleware.js";
import {
    addExpanses,
    dailyExpanses,
    addType,
    addFreq,
    addInc,
    getInc
} from "../Validations/expanses.validation.js";

const router = Router();

router.post('/add', validation(addExpanses, 'body'), ExpansesController.addDaily);
router.get('/get-daily', validation(dailyExpanses, 'query'), ExpansesController.getDaily);
router.post('/add-type', validation(addType, 'body'), TypeController.addType);
router.get('/get-type', TypeController.getType);
router.get('/get-freq', FreqController.allFreq);
router.post('/add-freq', validation(addFreq, 'body'), FreqController.addFreq);
router.get('/get-summary', validation(dailyExpanses, 'query'), ExpansesController.getSummary);
router.post('/add-income', validation(addInc, 'body'), IncomeController.addUserIncome);
router.get('/get-income', validation(getInc, 'query'), IncomeController.getUserIncome);
router.get('/daily-chart', validation(getInc, 'query'), ExpansesController.dailyChart);
router.get('/summary-analythic', validation(getInc, 'query'), ExpansesController.summAnalythic);

export default router;