import moment from "moment-timezone";
import {
    DailyExpnsIntfc,
    GetDailyExpIntfc,
    RawResultQuery
} from "../../Interfaces/expanses.interface.js";
import { InternalServerError, ApiSuccess } from "../../Helpers/response.helper.js";
import DailyExpanse from "../../Models/daily.model.js";
import { expansesSummaryAggr } from "../../Repositories/Expanses/summary.pipeline.js";

export const handleDailyExpanses = async (params: DailyExpnsIntfc) => {
    try {
        const savedData = new DailyExpanse({
            ...params,
            date: moment(params.date).format('YYYY-MM-DD HH:mm:ss')
        });
        await savedData.save();
        return ApiSuccess("Success")
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}

export const getDailyExpanses = async ({ start, end }: GetDailyExpIntfc) => {
    try {
        const startDate = moment(start).startOf("days").format('YYYY-MM-DD HH:mm:ss')
        const endDate = moment(end).endOf("days").format('YYYY-MM-DD HH:mm:ss')
        const dailyData = await DailyExpanse.find({
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        });

        return ApiSuccess("Success", dailyData);
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}

export const getSummaryExpanses = async ({ start, end }: GetDailyExpIntfc) => {
    try {
        const startDate: string = moment(start).startOf("days").format('YYYY-MM-DD HH:mm:ss')
        const endDate: string = moment(end).endOf("days").format('YYYY-MM-DD HH:mm:ss')
        const timeZone: string = moment.tz.guess()
        const rawData: RawResultQuery[] = await DailyExpanse.aggregate(
            expansesSummaryAggr(startDate, endDate, timeZone)
        );

        const sumNominal = rawData.reduce((acc, item) => acc + item.totalNominal, 0);
        const sumCount = rawData.reduce((acc, item) => acc + item.count, 0);
        const groupType = rawData.reduce((acc, item) => {
            const key = item.type;
            if (!acc[key]) acc[key] = { type: item.typeName, total: 0 };
            acc[key].total += item.totalNominal;

            return acc;
        }, {} as Record<string, { type: string, total: number }>);
        const groupDaily = rawData.reduce((acc, item) => {
            const key = item.date;
            if (!acc[key]) acc[key] = { date: item.date, total: 0, count: 0, avg: 0 };
            acc[key].total += item.totalNominal;
            acc[key].count += item.count;
            acc[key].avg = +(acc[key].total / acc[key].count).toFixed(2);

            return acc
        }, {} as Record<string, { date: string, total: number, count: number, avg: number }>);
        const rawDaily = Object.values(groupDaily).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const rawType = Object.values(groupType).sort((a, b) => b.total - a.total);
        const result = {
            total: sumNominal,
            avg: +(sumNominal / sumCount).toFixed(2),
            mostSpendType: rawType[0].type,
            dailyAvg: rawDaily,
            typeSpend: rawType,
        }

        return ApiSuccess("Success", result);
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}