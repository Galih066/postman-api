import Joi from "joi";

export const addExpanses = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    nominal: Joi.number().required(),
    type: Joi.string().required(),
    frequence: Joi.string().required(),
    date: Joi.string().required()
});