import Joi from "joi";

export const addExpanses = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    nominal: Joi.number().required(),
    type: Joi.string().required(),
    frequence: Joi.string().required(),
    date: Joi.string().required()
});

export const addType = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required()
});

export const addFreq = Joi.object({
    name: Joi.string().required(),
});

export const dailyExpanses = Joi.object({
    start: Joi.string().required(),
    end: Joi.string().required()
});