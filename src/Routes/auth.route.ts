import { Router } from "express";
import * as AuthController from "../Controllers/User/auth.controller.js";
import validation from "../Middlewares/validation.middleware.js";
import tokenValidation from "../Middlewares/auth.middleware.js";
import { loginUser } from "../Validations/user.validation.js";

const router = Router();

router.post('/login', validation(loginUser, 'body'), AuthController.login);
router.post('/register', validation(loginUser, 'body'), AuthController.register);
router.get('/user', tokenValidation, AuthController.user);

export default router;