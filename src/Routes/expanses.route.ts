import { Router } from "express";
import * as ExpansesController from "../Controllers/Expanses/daily.controller.js";
import * as TypeController from "../Controllers/Expanses/type.controller.js";
import * as FreqController from "../Controllers/Expanses/frequence.controller.js";
import validation from "../Middlewares/validation.middleware.js";
import { addExpanses, addType } from "../Validations/expanses.validation.js";
const router = Router();

router.post('/add', validation(addExpanses, 'body'), ExpansesController.addDaily);
router.get('/get-daily', ExpansesController.getDaily);
router.post('/add-type', validation(addType, 'body'), TypeController.addType);
router.get('/get-type', TypeController.getType);
router.get('/get-freq', FreqController.allFreq);

export default router;