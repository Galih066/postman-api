import type { RawResultQuery } from "../Interfaces/expanses.interface.js"

export const sumByType = (rawData: RawResultQuery[]) => {
    const typeResult = rawData.reduce((acc, item) => {
        const key = item.type;
        if (!acc[key]) acc[key] = { type: item.typeName, total: 0 };
        acc[key].total += item.totalNominal;

        return acc;
    }, {} as Record<string, { type: string, total: number }>);

    return Object.values(typeResult);
}

export const sumByFrequence = (rawData: RawResultQuery[]) => {
    const freqResult = rawData.reduce((acc, item) => {
        const key = item.freq;
        if (!acc[key]) acc[key] = { freq: item.freqName, total: 0 };
        acc[key].total += item.totalNominal;

        return acc;
    }, {} as Record<string, { freq: string, total: number }>);

    return Object.values(freqResult);
}

export const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) {
        if (current === 0) return { direction: 'no change', percentage: 0 };
        return { direction: 'up', percentage: 100 };
    }

    const change = current - previous;
    const percentage = Math.abs(change / previous * 100);
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'no change';

    return { direction, percentage: percentage.toFixed(2) };
}