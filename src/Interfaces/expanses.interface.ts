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

export interface RawResultQuery {
    totalNominal: number,
    count: number,
    date: string,
    type: string,
    freq: string,
    typeName: string
}

export interface AddIncomeIntfc {
    name: string,
    month: string,
    year: string,
    number: number,
}

export interface GetIncomeIntfc {
    month: string,
    year: string,
}

export interface DailyChartIntfc {
    date: string,
    total: number,
}