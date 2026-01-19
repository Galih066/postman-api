import { Router } from "express";
import * as IncomeController from '../Controllers/Expanses/income.controller.js'

const router = Router();
router.get('/add-user-income', IncomeController.addDefaultIncomeUser);

export default router