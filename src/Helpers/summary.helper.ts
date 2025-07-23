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