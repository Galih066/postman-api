export interface AddEventIntfc {
    name: string
    description?: string
    startedAt?: Date
    targetDays?: number | null
}

export interface UpdateEventIntfc extends AddEventIntfc {
    id: string
}

export interface ResetEventIntfc {
    id: string
    startedAt?: Date
}
