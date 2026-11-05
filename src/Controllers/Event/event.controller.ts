import { Request, Response } from "express";
import * as EventService from "../../Services/Event/event.services.js";
import { AddEventIntfc, UpdateEventIntfc, ResetEventIntfc } from "../../Interfaces/event.interface.js";

const getToken = (request: Request) => request.headers.authorization?.split(' ')[1] as string

export const addEvent = async (request: Request, response: Response) => {
    const result = await EventService.handleAddEvent(request.body as AddEventIntfc, getToken(request))
    response.status(result.statusCode).json(result)
}

export const eventList = async (request: Request, response: Response) => {
    const result = await EventService.handleEventList(getToken(request))
    response.status(result.statusCode).json(result)
}

export const eventDetail = async (request: Request, response: Response) => {
    const { id } = request.query as { id: string }
    const result = await EventService.handleEventDetail(id, getToken(request))
    response.status(result.statusCode).json(result)
}

export const updateEvent = async (request: Request, response: Response) => {
    const result = await EventService.handleUpdateEvent(request.body as UpdateEventIntfc, getToken(request))
    response.status(result.statusCode).json(result)
}

export const resetEvent = async (request: Request, response: Response) => {
    const result = await EventService.handleResetEvent(request.body as ResetEventIntfc, getToken(request))
    response.status(result.statusCode).json(result)
}

export const deleteEvent = async (request: Request, response: Response) => {
    const { id } = request.query as { id: string }
    const result = await EventService.handleDeleteEvent(id, getToken(request))
    response.status(result.statusCode).json(result)
}
