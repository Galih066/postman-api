import moment from "moment-timezone";
import { ApiSuccess, InternalServerError, NotFound } from "../../Helpers/response.helper.js"
import { GetDailyExpIntfc, GetIncomeIntfc } from "../../Interfaces/expanses.interface.js";
import { getMonthBetweenDateRange, dateRangeGenerator } from "../../Helpers/date.helper.js";
import { decodingToken } from "../../Helpers/string.helper.js";
import { findUserByUniqueKey } from "../../Helpers/data.helper.js";
import { DEFDATEFORMAT } from "../../utils/constants.js";
import DailyExpanse from "../../Models/daily.model.js";
import Income from "../../Models/income.model.js";
import { expansesSummaryAggr } from "../../Repositories/Expanses/summary.pipeline.js";

export const handleDateRangeMobile = async (params: GetDailyExpIntfc, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const start = moment(params.start).startOf('days').format('YYYY-MM-DD HH:mm:ss');
        const end = moment(params.end).endOf('days').format('YYYY-MM-DD HH:mm:ss');
        const rawMonthRange = getMonthBetweenDateRange(start, end, params.tz || moment.tz.guess()).sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.order - b.order;
        });
        const month = [...new Set(rawMonthRange.map(item => item.month.toLowerCase()))];
        const year = [...new Set(rawMonthRange.map(item => +item.year))];
        const firstData = rawMonthRange[0]
        const lastData = rawMonthRange[rawMonthRange.length - 1]
        const stMonthly = moment().month(firstData.order - 1).year(firstData.year).startOf('months').startOf('days').format(DEFDATEFORMAT)
        const endMonthly = moment().month(lastData.order - 1).year(lastData.year).endOf('months').endOf('days').format(DEFDATEFORMAT)
        const expanses = await DailyExpanse.aggregate([
            { $match: { createdAt: { $gte: new Date(start), $lte: new Date(end) } } },
            {
                $lookup: {
                    from: "types",
                    localField: "type",
                    foreignField: "code",
                    as: "typeName"
                }
            },
            {
                $lookup: {
                    from: "frequences",
                    localField: "frequence",
                    foreignField: "code",
                    as: "freqName"
                }
            },
            { $unwind: "$typeName" },
            { $unwind: "$freqName" },
            {
                $project: {
                    name: 1,
                    description: 1,
                    nominal: 1,
                    type: "$typeName.name",
                    freq: "$freqName.name",
                    date: "$createdAt"
                }
            },
            { $sort: { date: -1 } }
        ]);

        const income = await Income.aggregate([
            {
                $match: {
                    $or: [
                        { month: { $in: month } },
                        { year: { $in: year } }
                    ]
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    month: 1,
                    year: 1,
                    actual: 1,
                    budget: 1
                }
            }
        ]);

        const totalIncome = income.reduce((acc, item) => acc + item.actual, 0);
        const totalBudget = income.reduce((acc, item) => acc + item.budget, 0);
        const totalExpanses = expanses.reduce((acc, item) => acc + item.nominal, 0);
        const expansesList = expanses.map(item => ({ ...item, date: moment(item.date).format(DEFDATEFORMAT) }));
        const result = {
            totalIncome,
            totalBudget,
            totalExpanses,
            list: expansesList
        };

        return ApiSuccess("Success", result);
    } catch (error) {
        console.error(error);
        return InternalServerError();
    }
}

export const handleDashboard = async ({ month, year, tz }: GetIncomeIntfc, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const timeZone = tz || moment.tz.guess()
        const monthStart = moment.tz(timeZone).month(month).year(+year).startOf('month').utc().toISOString()
        const monthEnd = moment.tz(timeZone).month(month).year(+year).endOf('month').utc().toISOString()
        const todayStart = moment.tz(timeZone).startOf('day').utc().toISOString()
        const todayEnd = moment.tz(timeZone).endOf('day').utc().toISOString()
        const weekStart = moment.tz(timeZone).subtract(6, 'days').startOf('day').utc().toISOString()

        const [monthExpenses, incomeData, todayData, recentTx, weeklyRaw] = await Promise.all([
            DailyExpanse.aggregate(expansesSummaryAggr(monthStart, monthEnd, timeZone, user._id)),
            Income.find({ month: month.toLowerCase(), year, userId: user._id }),
            DailyExpanse.aggregate([
                { $match: { date: { $gte: new Date(todayStart), $lte: new Date(todayEnd) }, userId: user._id } },
                { $group: { _id: null, total: { $sum: '$nominal' }, count: { $sum: 1 } } }
            ]),
            DailyExpanse.aggregate([
                { $match: { userId: user._id } },
                { $sort: { date: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'types',
                        let: { typeCode: '$type', uid: '$userId' },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $eq: ['$code', '$$typeCode'] }, { $eq: ['$userId', '$$uid'] }] } } }
                        ],
                        as: 'typeName'
                    }
                },
                { $unwind: '$typeName' },
                { $project: { _id: 0, name: 1, nominal: 1, type: '$typeName.name', date: 1 } }
            ]),
            DailyExpanse.aggregate([
                { $match: { date: { $gte: new Date(weekStart), $lte: new Date(todayEnd) }, userId: user._id } },
                { $addFields: { dateOnly: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: timeZone } } } },
                { $group: { _id: '$dateOnly', date: { $first: '$dateOnly' }, total: { $sum: '$nominal' } } },
                { $project: { _id: 0 } },
                { $sort: { date: 1 } }
            ])
        ])

        const totalExpenses = monthExpenses.reduce((acc, item) => acc + item.totalNominal, 0)
        const totalIncome = incomeData.reduce((acc, item) => acc + item.actual, 0)
        const totalBudget = incomeData.reduce((acc, item) => acc + item.budget, 0)
        const budgetUsedPercent = totalBudget > 0 ? +((totalExpenses / totalBudget) * 100).toFixed(2) : 0

        type CategorySummary = { type: string; total: number }
        const typeMap = monthExpenses.reduce<Record<string, CategorySummary>>((acc, item) => {
            if (!acc[item.type]) acc[item.type] = { type: item.typeName, total: 0 }
            acc[item.type].total += item.totalNominal
            return acc
        }, {})
        const topCategories = Object.values(typeMap)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
            .map(item => ({
                ...item,
                percent: totalExpenses > 0 ? +((item.total / totalExpenses) * 100).toFixed(2) : 0
            }))

        const weekDates = dateRangeGenerator(weekStart, todayEnd, timeZone)
        const weeklyMap = new Map(weeklyRaw.map((item: { date: string; total: number }) => [item.date, item.total]))
        const weeklyTrend = weekDates.map(date => ({ date, total: weeklyMap.get(date) ?? 0 }))

        const result = {
            month: {
                income: totalIncome,
                budget: totalBudget,
                expenses: totalExpenses,
                savingsByBudget: totalBudget - totalExpenses,
                savingsByIncome: totalIncome - totalExpenses,
                budgetUsedPercent
            },
            today: {
                total: todayData[0]?.total ?? 0,
                count: todayData[0]?.count ?? 0
            },
            recentTransactions: recentTx,
            topCategories,
            weeklyTrend
        }

        return ApiSuccess('Success', result)
    } catch (error) {
        console.error(error)
        return InternalServerError()
    }
}

export const handleTransactions = async ({ month, year, tz }: GetIncomeIntfc, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const timeZone = tz || moment.tz.guess()
        const monthStart = moment.tz(timeZone).month(month).year(+year).startOf('month').utc().toISOString()
        const monthEnd = moment.tz(timeZone).month(month).year(+year).endOf('month').utc().toISOString()

        const rawData = await DailyExpanse.aggregate([
            { $match: { userId: user._id, date: { $gte: new Date(monthStart), $lte: new Date(monthEnd) } } },
            {
                $lookup: {
                    from: 'types',
                    let: { typeCode: '$type', uid: '$userId' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$code', '$$typeCode'] }, { $eq: ['$userId', '$$uid'] }] } } }
                    ],
                    as: 'typeName'
                }
            },
            {
                $lookup: {
                    from: 'frequences',
                    let: { freqCode: '$frequence', uid: '$userId' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$code', '$$freqCode'] }, { $eq: ['$userId', '$$uid'] }] } } }
                    ],
                    as: 'freqName'
                }
            },
            { $unwind: '$typeName' },
            { $unwind: '$freqName' },
            {
                $addFields: {
                    dateOnly: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: timeZone } }
                }
            },
            {
                $group: {
                    _id: '$dateOnly',
                    date: { $first: '$dateOnly' },
                    total: { $sum: '$nominal' },
                    count: { $sum: 1 },
                    transactions: {
                        $push: {
                            name: '$name',
                            description: '$description',
                            nominal: '$nominal',
                            type: '$typeName.name',
                            freq: '$freqName.name',
                        }
                    }
                }
            },
            { $sort: { date: -1 } },
            { $project: { _id: 0 } }
        ])

        const result = rawData.map(item => ({
            ...item,
            day: moment(item.date).format('dddd'),
        }))

        return ApiSuccess('Success', result)
    } catch (error) {
        console.error(error)
        return InternalServerError()
    }
}