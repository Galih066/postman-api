import Joi from "joi";

const objectId = Joi.string().hex().length(24);
const startedAt = Joi.date().iso().max('now');
const targetDays = Joi.number().integer().min(1).allow(null);

export const addEvent = Joi.object({
    name: Joi.string().trim().max(100).required(),
    description: Joi.string().trim().max(500).allow('').optional(),
    startedAt: startedAt.optional(),
    targetDays: targetDays.optional(),
});

export const updEvent = Joi.object({
    id: objectId.required(),
    name: Joi.string().trim().max(100).required(),
    description: Joi.string().trim().max(500).allow('').optional(),
    startedAt: startedAt.optional(),
    targetDays: targetDays.optional(),
});

export const eventId = Joi.object({
    id: objectId.required(),
});

export const resetEvent = Joi.object({
    id: objectId.required(),
    startedAt: startedAt.optional(),
});
