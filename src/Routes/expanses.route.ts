import { Router } from "express";
import * as ExpansesController from "../Controllers/Expanses/daily.controller.js";
import * as TypeController from "../Controllers/Expanses/type.controller.js";
import * as FreqController from "../Controllers/Expanses/frequence.controller.js";
import * as IncomeController from "../Controllers/Expanses/income.controller.js";
import validation from "../Middlewares/validation.middleware.js";
import tokenValidation from "../Middlewares/auth.middleware.js";
import {
    addExpanses,
    dailyExpanses,
    addType,
    addFreq,
    addInc,
    getInc,
    expansesList
} from "../Validations/expanses.validation.js";

const router = Router();

router.post('/add', [tokenValidation, validation(addExpanses, 'body')], ExpansesController.addDaily);
router.get('/get-daily', [tokenValidation, validation(dailyExpanses, 'query')], ExpansesController.getDaily);
router.post('/add-type', [tokenValidation, validation(addType, 'body')], TypeController.addType);
router.get('/get-type', tokenValidation, TypeController.getType);
router.get('/get-freq', tokenValidation, FreqController.allFreq);
router.post('/add-freq', [tokenValidation, validation(addFreq, 'body')], FreqController.addFreq);
router.get('/get-summary', [tokenValidation, validation(dailyExpanses, 'query')], ExpansesController.getSummary);
router.post('/add-income', [tokenValidation, validation(addInc, 'body')], IncomeController.addUserIncome);
router.get('/all-income', tokenValidation, IncomeController.getAllUserIncome);
router.get('/get-income', [tokenValidation, validation(getInc, 'query')], IncomeController.getUserIncome);
router.get('/daily-chart', [tokenValidation, validation(getInc, 'query')], ExpansesController.dailyChart);
router.get('/summary-analythic', [tokenValidation, validation(getInc, 'query')], ExpansesController.summAnalythic);
router.get('/list', [tokenValidation, validation(expansesList, 'query')], ExpansesController.dailyList);
router.get('/monthly-summary', tokenValidation, ExpansesController.monthlySummary);
router.get('/get-non-daily', [tokenValidation, validation(dailyExpanses, 'query')], ExpansesController.getNonDaily);

export default router;