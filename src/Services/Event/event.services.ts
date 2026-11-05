import mongoose from "mongoose";
import Event from "../../Models/event.model.js";
import { AddEventIntfc, UpdateEventIntfc, ResetEventIntfc } from "../../Interfaces/event.interface.js";
import { ApiSuccess, BadRequest, InternalServerError, NotFound } from "../../Helpers/response.helper.js";
import { resolveUser } from "../../Helpers/data.helper.js";

const DAY_MS = 24 * 60 * 60 * 1000

type EventHistory = { startedAt: Date; endedAt: Date }
type EventDoc = {
    _id: mongoose.Types.ObjectId
    name: string
    description?: string | null
    startedAt: Date
    targetDays?: number | null
    history: EventHistory[]
}

const toDays = (ms: number) => +(ms / DAY_MS).toFixed(1)

// Shapes an event for the client. Elapsed time is computed on the client from startedAt and serverTime;
// isOverdue here is a snapshot at response time.
const mapEvent = (event: EventDoc, now: Date) => {
    const intervals = event.history.map(h => h.endedAt.getTime() - h.startedAt.getTime())
    const targetAt = event.targetDays ? new Date(event.startedAt.getTime() + event.targetDays * DAY_MS) : null

    return {
        id: event._id,
        name: event.name,
        description: event.description ?? '',
        startedAt: event.startedAt,
        targetDays: event.targetDays ?? null,
        targetAt,
        isOverdue: targetAt ? now >= targetAt : false,
        resetCount: event.history.length,
        avgIntervalDays: intervals.length ? toDays(intervals.reduce((a, b) => a + b, 0) / intervals.length) : null,
    }
}

export const handleAddEvent = async (params: AddEventIntfc, token: string) => {
    try {
        const user = await resolveUser(token)
        if (!user) return NotFound('User not found')

        await Event.create({
            userId: user._id,
            name: params.name,
            description: params.description ?? '',
            startedAt: params.startedAt ?? new Date(),
            targetDays: params.targetDays ?? null,
        })

        return ApiSuccess('Success')
    } catch (error) {
        console.error(error)
        return InternalServerError()
    }
}

export const handleEventList = async (token: string) => {
    try {
        const user = await resolveUser(token)
        if (!user) return NotFound('User not found')

        // Oldest startedAt first = the event that has been running the longest
        const events = await Event.find({ userId: user._id }).sort({ startedAt: 1 }).lean<EventDoc[]>()
        const now = new Date()

        return ApiSuccess('Success', { serverTime: now, events: events.map(item => mapEvent(item, now)) })
    } catch (error) {
        console.error(error)
        return InternalServerError()
    }
}

export const handleEventDetail = async (id: string, token: string) => {
    try {
        const user = await resolveUser(token)
        if (!user) return NotFound('User not found')

        const event = await Event.findOne({ _id: new mongoose.Types.ObjectId(id), userId: user._id }).lean<EventDoc>()
        if (!event) return NotFound('Event not found')

        const now = new Date()
        const history = [...event.history]
            .reverse()
            .map(h => ({ ...h, durationDays: toDays(h.endedAt.getTime() - h.startedAt.getTime()) }))

        return ApiSuccess('Success', { serverTime: now, ...mapEvent(event, now), history })
    } catch (error) {
        console.error(error)
        return InternalServerError()
    }
}

export const handleUpdateEvent = async (params: UpdateEventIntfc, token: string) => {
    try {
        const user = await resolveUser(token)
        if (!user) return NotFound('User not found')

        const event = await Event.findOne({ _id: new mongoose.Types.ObjectId(params.id), userId: user._id })
        if (!event) return NotFound('Event not found')

        event.name = params.name
        if (params.description !== undefined) event.description = params.description
        if (params.targetDays !== undefined) event.targetDays = params.targetDays

        if (params.startedAt) {
            // Keep history consistent: the current period starts where the last one ended
            const lastHistory = event.history[event.history.length - 1]
            if (lastHistory && params.startedAt <= lastHistory.startedAt) {
                return BadRequest('startedAt must be after the start of the previous period')
            }
            if (lastHistory) lastHistory.endedAt = params.startedAt
            event.startedAt = params.startedAt
        }

        await event.save()
        return ApiSuccess('Success')
    } catch (error) {
        console.error(error)
        return InternalServerError()
    }
}

export const handleResetEvent = async (params: ResetEventIntfc, token: string) => {
    try {
        const user = await resolveUser(token)
        if (!user) return NotFound('User not found')

        const event = await Event.findOne({ _id: new mongoose.Types.ObjectId(params.id), userId: user._id })
        if (!event) return NotFound('Event not found')

        const newStart = params.startedAt ?? new Date()
        if (newStart <= event.startedAt) return BadRequest('Reset date must be after the current startedAt')

        event.history.push({ startedAt: event.startedAt, endedAt: newStart })
        event.startedAt = newStart
        await event.save()

        return ApiSuccess('Success')
    } catch (error) {
        console.error(error)
        return InternalServerError()
    }
}

export const handleDeleteEvent = async (id: string, token: string) => {
    try {
        const user = await resolveUser(token)
        if (!user) return NotFound('User not found')

        const deleted = await Event.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id), userId: user._id })
        if (!deleted) return NotFound('Event not found')

        return ApiSuccess('Success')
    } catch (error) {
        console.error(error)
        return InternalServerError()
    }
}
