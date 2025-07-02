import { Router } from "express";
import * as ExpansesController from "../Controllers/Expanses/daily.controller.js";
import validation from "../Middlewares/validation.middleware.js";
import { addExpanses } from "../Validations/expanses.validation.js";
const router = Router();

router.post('/add', validation(addExpanses, 'body'), ExpansesController.addDaily);

export default router;