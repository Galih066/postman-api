import moment from "moment-timezone";
import {
    DailyExpnsIntfc,
    GetDailyExpIntfc,
    RawResultQuery,
    GetIncomeIntfc,
    DailyChartIntfc
} from "../../Interfaces/expanses.interface.js";
import { InternalServerError, ApiSuccess } from "../../Helpers/response.helper.js";
import { dateRangeGenerator } from "../../Helpers/date.helper.js";
import {
    sumByType,
    sumByFrequence,
    getPercentageChange
} from "../../Helpers/summary.helper.js";
import DailyExpanse from "../../Models/daily.model.js";
import Income from "../../Models/income.model.js";
import {
    expansesSummaryAggr,
    dailyChartAggr
} from "../../Repositories/Expanses/summary.pipeline.js";

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
        console.log(startDate, endDate)
        const dailyData = await DailyExpanse
            .find({ date: { $gte: new Date(startDate), $lte: new Date(endDate) } })
            .sort({ type: 1 });

        console.log('Get Daily expanses', startDate, endDate)
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

        if (!rawData.length) return ApiSuccess("Success", []);

        const sumNominal = rawData.reduce((acc, item) => acc + item.totalNominal, 0);
        const sumCount = rawData.reduce((acc, item) => acc + item.count, 0);
        const dayCount = moment(end).diff(moment(start), 'days') + 1;
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
            avgTransaction: +(sumNominal / sumCount).toFixed(2),
            avgPerDays: +(sumNominal / dayCount).toFixed(2),
            mostSpendType: rawType[0].type,
            dailyAvg: rawDaily,
            typeSpend: rawType,
        }

        console.log('Get Summary expanses', startDate, endDate)
        return ApiSuccess("Success", result);
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}

export const getDailyChart = async ({ month, year, tz }: GetIncomeIntfc) => {
    try {
        const start = moment().month(month).year(+year).startOf("month").format('YYYY-MM-DD HH:mm:ss');
        const end = moment().month(month).year(+year).endOf("month").format('YYYY-MM-DD HH:mm:ss');
        const arrDateRange = dateRangeGenerator(start, end);
        const rawSummary: DailyChartIntfc[] = await DailyExpanse.aggregate(
            dailyChartAggr(start, end, tz)
        );

        const result: { date: string, total: number }[] = [];
        arrDateRange.forEach(item => {
            const defaultVal = { date: item, total: 0 };
            const foundData = rawSummary.find(value => item === value.date);
            if (foundData) result.push(foundData);
            if (!foundData) result.push(defaultVal);
        });

        console.log('Get Daily Chart', start, end)
        return ApiSuccess("Success", result);
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}

export const getSummaryAnalysis = async ({ month, year, tz }: GetIncomeIntfc) => {
    try {
        const start = moment().month(month).year(+year).startOf("month").format('YYYY-MM-DD HH:mm:ss');
        const end = moment().month(month).year(+year).endOf("month").format('YYYY-MM-DD HH:mm:ss');
        const lastMonthStart = moment().month(month).year(+year).subtract({ month: 1 }).startOf("month").format('YYYY-MM-DD HH:mm:ss');
        const lastMonthEnd = moment().month(month).year(+year).subtract({ month: 1 }).endOf("month").format('YYYY-MM-DD HH:mm:ss');
        const lastMonthName = moment(lastMonthStart).format('MMMM').toLowerCase();
        const yearAdjustment = moment(lastMonthStart).format('YYYY');
        const [expanses, lastMnthExp, income, lastMnthInc] = await Promise.all([
            DailyExpanse.aggregate(expansesSummaryAggr(start, end, tz)),
            DailyExpanse.aggregate(expansesSummaryAggr(lastMonthStart, lastMonthEnd, tz)),
            Income.find({ month: month.toLowerCase(), year }).select('createdAt actual budget'),
            Income.find({ month: lastMonthName, year: yearAdjustment }).select('createdAt actual budget')
        ]);
        const totalExpanses = expanses.reduce((acc, item) => acc + item.totalNominal, 0);
        const totalIncome = income.reduce((acc, item) => acc + item.actual, 0);
        const totalBudget = income.reduce((acc, item) => acc + item.budget, 0);
        const lstMonthTotalExpanses = lastMnthExp.reduce((acc, item) => acc + item.totalNominal, 0);
        const lstMonthTotalIncome = lastMnthInc.reduce((acc, item) => acc + item.actual, 0);
        const lstMonthTotalBudget = lastMnthInc.reduce((acc, item) => acc + item.budget, 0);
        const summPercentage = getPercentageChange(totalExpanses, lstMonthTotalExpanses);
        const summPercentInc = getPercentageChange(totalIncome, lstMonthTotalIncome);
        const budgetPercentg = (totalExpanses / totalBudget) * 100;
        const savingsByBudget = totalBudget - totalExpanses;
        const savingsBySallary = totalIncome - totalExpanses;

        const result = {
            expanses: totalExpanses,
            income: totalIncome,
            budget: totalBudget,
            lastMonthExpanses: lstMonthTotalExpanses,
            lastMonthIncome: lstMonthTotalIncome,
            lastMonthBudget: lstMonthTotalBudget,
            percentage: summPercentage.percentage,
            direction: summPercentage.direction,
            percIncome: summPercentInc.percentage,
            directionIncome: summPercentInc.direction,
            budgetPercentg: +(+budgetPercentg.toFixed(2)),
            savingsByBudget,
            savingsBySallary,
            byType: sumByType(expanses),
            byFreq: sumByFrequence(expanses),
        }

        console.log('Get Summary Analythic', start, end, tz)
        return ApiSuccess("Success", result);
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}