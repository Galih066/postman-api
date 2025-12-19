import Joi from "joi";

export const loginUser = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

export const getUser = Joi.object({
    email: Joi.string().email().required()
});

export const addProfile = Joi.object({
    name: Joi.string().required(),
    gender: Joi.string().valid('male', 'female').required(),
    phone: Joi.number().required(),
    address: Joi.string().required(),
});