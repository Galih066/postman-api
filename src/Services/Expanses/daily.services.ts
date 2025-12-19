import moment from "moment-timezone";
import {
    DailyExpnsIntfc,
    GetDailyExpIntfc,
    RawResultQuery,
    GetIncomeIntfc,
    DailyChartIntfc
} from "../../Interfaces/expanses.interface.js";
import { InternalServerError, ApiSuccess, NotFound } from "../../Helpers/response.helper.js";
import {
    dateRangeGenerator,
    getMonthBetweenDateRange,
    getDateRangeByArray
} from "../../Helpers/date.helper.js";
import {
    sumByType,
    sumByFrequence,
    getPercentageChange
} from "../../Helpers/summary.helper.js";
import { capitalize, decodingToken } from "../../Helpers/string.helper.js";
import DailyExpanse from "../../Models/daily.model.js";
import Income from "../../Models/income.model.js";
import {
    expansesSummaryAggr,
    dailyChartAggr,
    monthlySummaryAggr,
    monthlyIncomeAggr
} from "../../Repositories/Expanses/summary.pipeline.js";
import { DEFDATEFORMAT, DEFMONTH } from "../../Utils/constants.js";
import { findUserByUniqueKey } from "../../Helpers/data.helper.js";

export const handleDailyExpanses = async (params: DailyExpnsIntfc, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const savedData = new DailyExpanse({
            ...params,
            userId: user._id,
            date: moment(params.date).format(DEFDATEFORMAT)
        });

        await savedData.save();
        return ApiSuccess("Success")
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}

export const getDailyExpanses = async ({ start, end, tz }: GetDailyExpIntfc, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const timeZone = tz || moment.tz.guess()
        const startDate = moment.tz(start, timeZone).startOf("days").utc().toISOString()
        const endDate = moment.tz(end, timeZone).endOf("days").utc().toISOString()
        const dailyData = await DailyExpanse
            .find({
                date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                userId: user._id
            })
            .select('name description nominal type frequence date -_id')
            .sort({ type: 1 });

        return ApiSuccess("Success", dailyData);
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}

export const getNonDailyExpanses = async ({ start, end, tz }: GetDailyExpIntfc, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const timeZone = tz || moment.tz.guess()
        const startDate = moment.tz(start, timeZone).startOf("days").utc().toISOString()
        const endDate = moment.tz(end, timeZone).endOf("days").utc().toISOString()
        const dailyData = await DailyExpanse.aggregate([
            {
                $match: {
                    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
                    frequence: { $in: ["FREQ-002", "FREQ-003"] },
                    userId: user._id
                }
            },
            {
                $lookup: {
                    from: "types",
                    localField: "type",
                    foreignField: "code",
                    as: "typeName"
                }
            },
            { $unwind: "$typeName" },
            {
                $project: {
                    name: 1,
                    description: 1,
                    nominal: 1,
                    date: 1,
                    type: "$typeName.name"
                }
            }
        ])

        const total = dailyData.reduce((acc, item: any) => acc += item.nominal, 0)
        const result = { total, raw: dailyData }

        return ApiSuccess("Success", result);
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}

export const getSummaryExpanses = async ({ start, end, tz }: GetDailyExpIntfc, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const timeZone: string = tz || moment.tz.guess()
        const startDate: string = moment.tz(start, timeZone).startOf("days").utc().toISOString()
        const endDate: string = moment.tz(end, timeZone).endOf("days").utc().toISOString()
        const monthList = getMonthBetweenDateRange(startDate, endDate)
        const monthArr = monthList.map(item => item.month)
        const yearArr = monthList.map(item => item.year)
        const budget: { _id: any, totalBudget: number }[] = await Income.aggregate([
            {
                $match: {
                    month: { $in: monthArr },
                    year: { $in: yearArr },
                    userId: user._id
                }
            },
            {
                $group: {
                    _id: null,
                    totalBudget: { $sum: "$budget" }
                }
            }
        ])
        const dateRange = getDateRangeByArray(monthList)
        const [rawData, overalRaw]: [RawResultQuery[], RawResultQuery[]] = await Promise.all([
            DailyExpanse.aggregate(expansesSummaryAggr(startDate, endDate, timeZone, user._id)),
            DailyExpanse.aggregate(expansesSummaryAggr(dateRange.start, dateRange.end, timeZone, user._id))
        ])

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
        const sumOveral = overalRaw.reduce((acc, item) => acc + item.totalNominal, 0)
        const rawDaily = Object.values(groupDaily).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const rawType = Object.values(groupType).sort((a, b) => b.total - a.total);
        const result = {
            total: sumNominal,
            overalExpanses: sumOveral,
            overalBudget: budget[0].totalBudget,
            avgTransaction: +(sumNominal / sumCount).toFixed(2),
            avgPerDays: +(sumNominal / dayCount).toFixed(2),
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

export const getDailyChart = async ({ month, year, tz }: GetIncomeIntfc, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const timeZone = tz || moment.tz.guess()
        const start = moment.tz(timeZone).month(month).year(+year).startOf("month").utc().toISOString();
        const end = moment.tz(timeZone).month(month).year(+year).endOf("month").utc().toISOString();
        const arrDateRange = dateRangeGenerator(start, end);
        const rawSummary: DailyChartIntfc[] = await DailyExpanse.aggregate(dailyChartAggr(start, end, tz, user._id));
        const result: { date: string, total: number }[] = [];

        arrDateRange.forEach(item => {
            const defaultVal = { date: item, total: 0 };
            const foundData = rawSummary.find(value => item === value.date);
            if (foundData) result.push(foundData);
            if (!foundData) result.push(defaultVal);
        });

        return ApiSuccess("Success", result);
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}

export const getSummaryAnalysis = async ({ month, year, tz }: GetIncomeIntfc, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const timeZone = tz || moment.tz.guess()
        const start = moment.tz(timeZone).month(month).year(+year).startOf("month").utc().toISOString();
        const end = moment.tz(timeZone).month(month).year(+year).endOf("month").utc().toISOString();
        const lastMonthStart = moment.tz(timeZone).month(month).year(+year).subtract({ month: 1 }).startOf("month").utc().toISOString();
        const lastMonthEnd = moment.tz(timeZone).month(month).year(+year).subtract({ month: 1 }).endOf("month").utc().toISOString();
        const lastMonthName = moment(lastMonthStart).format('MMMM').toLowerCase();
        const yearAdjustment = moment(lastMonthStart).format('YYYY');
        const [expanses, lastMnthExp, income, lastMnthInc] = await Promise.all([
            DailyExpanse.aggregate(expansesSummaryAggr(start, end, tz, user._id)),
            DailyExpanse.aggregate(expansesSummaryAggr(lastMonthStart, lastMonthEnd, tz, user._id)),
            Income.find({ month: month.toLowerCase(), year, userId: user._id }).select('createdAt actual budget'),
            Income.find({ month: lastMonthName, year: yearAdjustment, userId: user._id }).select('createdAt actual budget')
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

export const getExpansesList = async (page: string, limit: string, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const pages = +page || 1
        const limits = +limit || 10
        const skips = (pages - 1) * limits
        const [rawList, total] = await Promise.all([
            DailyExpanse.find({ userId: user._id })
                .select('name description nominal type frequence date')
                .sort({ createdAt: -1 })
                .skip(skips)
                .limit(limits),
            DailyExpanse.find({ userId: user._id }).countDocuments()
        ])
        const result = {
            data: rawList,
            paginations: {
                total,
                pages,
                limits,
                totalPages: Math.ceil(total / limits)
            }
        }

        return ApiSuccess("Success", result)
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}

export const getMonthlySummary = async (params: any, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const timeZone = params.tz;
        const incomeYear = await Income.aggregate(monthlyIncomeAggr(user._id));
        const expanses = await DailyExpanse.aggregate(monthlySummaryAggr(timeZone, user._id));
        const mappingExpanses = expanses.map(item => ({ ...item, monthName: DEFMONTH[item.month].toLowerCase() }));
        const result: any = [];
        const mapIncome = new Map(incomeYear.map(item => [`${item.year}-${item.month}`, item.budget]));

        mappingExpanses.forEach(item => {
            const key = `${item.year}-${item.monthName}`;
            result.push({
                ...item,
                monthName: capitalize(item.monthName),
                budget: mapIncome.get(key)
            });
        });

        return ApiSuccess("Success", result);
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}