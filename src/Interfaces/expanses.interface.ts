export interface DailyExpnsIntfc {
    name: string,
    description: string,
    nominal: number,
    type: string,
    frequence: string,
    date: string
}

export interface GetDailyExpIntfc {
    start: string,
    end: string
}