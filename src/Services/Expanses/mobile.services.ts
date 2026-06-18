import moment from "moment-timezone";
import mongoose from "mongoose";
import { ApiSuccess, InternalServerError, NotFound } from "../../Helpers/response.helper.js"
import { GetDailyExpIntfc, GetIncomeIntfc } from "../../Interfaces/expanses.interface.js";
import { getMonthBetweenDateRange, dateRangeGenerator } from "../../Helpers/date.helper.js";
import { decodingToken } from "../../Helpers/string.helper.js";
import { findUserByUniqueKey } from "../../Helpers/data.helper.js";
import { DEFDATEFORMAT } from "../../utils/constants.js";
import DailyExpanse from "../../Models/daily.model.js";
import Income from "../../Models/income.model.js";
import { expansesSummaryAggr } from "../../Repositories/Expanses/summary.pipeline.js";

export const handleDeleteExpanse = async (id: string, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const deleted = await DailyExpanse.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id), userId: user._id })

        if (!deleted) return NotFound('Expense not found')

        return ApiSuccess('Success')
    } catch (error) {
        console.error(error)
        return InternalServerError()
    }
}

export const handleUpdateExpanse = async (params: { id: string; name: string; description: string; nominal: number; type: string; frequence: string; date: string }, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const updated = await DailyExpanse.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(params.id), userId: user._id },
            { name: params.name, description: params.description, nominal: params.nominal, type: params.type, frequence: params.frequence, date: new Date(params.date) },
            { new: true }
        )

        if (!updated) return NotFound('Expense not found')

        return ApiSuccess('Success')
    } catch (error) {
        console.error(error)
        return InternalServerError()
    }
}

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

export const handleExpanseDetail = async (id: string, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const data = await DailyExpanse.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id), userId: user._id } },
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
                $project: {
                    _id: 0,
                    name: 1,
                    description: 1,
                    nominal: 1,
                    type: '$typeName.name',
                    typeCode: '$type',
                    freq: '$freqName.name',
                    freqCode: '$frequence',
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    day: { $dayOfWeek: '$date' }
                }
            }
        ])

        if (!data.length) return NotFound('Expense not found')

        const item = data[0]
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const result = { ...item, day: dayNames[item.day - 1] }

        return ApiSuccess('Success', result)
    } catch (error) {
        console.error(error)
        return InternalServerError()
    }
}

const resolveIncomeStatus = (data: { actual: number }[]) => {
    if (data.length === 0) return { isSet: false, isUpdated: false, message: 'Income has not been set for this month' }
    if (data.every(item => item.actual === 0)) return { isSet: true, isUpdated: false, message: 'Income record exists but actual amount has not been updated' }
    return { isSet: true, isUpdated: true, message: 'Income has been set for this month' }
}

export const handleDashboard = async (token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const timeZone = moment.tz.guess()
        const month = moment().format('MMMM')
        const year = moment().format('YYYY')
        const monthStart = moment.tz(timeZone).startOf('month').utc().toISOString()
        const monthEnd = moment.tz(timeZone).endOf('month').utc().toISOString()
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
            incomeStatus: resolveIncomeStatus(incomeData),
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
                            id: '$_id',
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

export const handleMonthlyReport = async ({ month, year, tz }: GetIncomeIntfc, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const timeZone = tz || moment.tz.guess()
        const mth = moment().month(month).year(+year)
        const monthStart = mth.clone().startOf('month').utc().toISOString()
        const monthEnd = mth.clone().endOf('month').utc().toISOString()
        const daysInMonth = mth.daysInMonth()

        const weekLabels: Record<number, string> = {
            1: `${mth.clone().date(1).format('MMM D')} - ${mth.clone().date(7).format('D')}`,
            2: `${mth.clone().date(8).format('MMM D')} - ${mth.clone().date(14).format('D')}`,
            3: `${mth.clone().date(15).format('MMM D')} - ${mth.clone().date(21).format('D')}`,
            4: `${mth.clone().date(22).format('MMM D')} - ${mth.clone().date(daysInMonth).format('D')}`,
        }

        const [rawExpenses, incomeData, topTx, txByCategory] = await Promise.all([
            DailyExpanse.aggregate(expansesSummaryAggr(monthStart, monthEnd, timeZone, user._id)),
            Income.find({ month: month.toLowerCase(), year, userId: user._id }),
            DailyExpanse.aggregate([
                { $match: { userId: user._id, date: { $gte: new Date(monthStart), $lte: new Date(monthEnd) } } },
                { $sort: { nominal: -1 } },
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
                {
                    $addFields: {
                        dateOnly: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: timeZone } }
                    }
                },
                { $project: { _id: 0, name: 1, nominal: 1, type: '$typeName.name', date: '$dateOnly' } }
            ]),
            DailyExpanse.aggregate([
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
                { $unwind: '$typeName' },
                {
                    $addFields: {
                        dateOnly: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: timeZone } }
                    }
                },
                {
                    $group: {
                        _id: '$type',
                        type: { $first: '$typeName.name' },
                        total: { $sum: '$nominal' },
                        count: { $sum: 1 },
                        transactions: {
                            $push: { name: '$name', nominal: '$nominal', date: '$dateOnly' }
                        }
                    }
                },
                { $sort: { total: -1 } },
                { $project: { _id: 0 } }
            ])
        ])

        const totalExpenses = rawExpenses.reduce((acc, item) => acc + item.totalNominal, 0)
        const totalIncome = incomeData.reduce((acc, item) => acc + item.actual, 0)
        const totalBudget = incomeData.reduce((acc, item) => acc + item.budget, 0)
        const totalTransactions = rawExpenses.reduce((acc, item) => acc + item.count, 0)
        const activeDays = new Set(rawExpenses.map(item => item.date)).size
        const budgetUsedPercent = totalBudget > 0 ? +((totalExpenses / totalBudget) * 100).toFixed(2) : 0
        const dailyAverage = Math.round(totalExpenses / daysInMonth)

        type CategorySummary = { type: string; total: number; count: number }
        const categoryMap = rawExpenses.reduce<Record<string, CategorySummary>>((acc, item) => {
            if (!acc[item.type]) acc[item.type] = { type: item.typeName, total: 0, count: 0 }
            acc[item.type].total += item.totalNominal
            acc[item.type].count += item.count
            return acc
        }, {})
        const byCategory = Object.values(categoryMap)
            .sort((a, b) => b.total - a.total)
            .map(item => ({ ...item, percent: totalExpenses > 0 ? +((item.total / totalExpenses) * 100).toFixed(2) : 0 }))

        type FreqSummary = { freq: string; total: number }
        const freqMap = rawExpenses.reduce<Record<string, FreqSummary>>((acc, item) => {
            if (!acc[item.freq]) acc[item.freq] = { freq: item.freqName, total: 0 }
            acc[item.freq].total += item.totalNominal
            return acc
        }, {})
        const byFrequency = Object.values(freqMap)
            .sort((a, b) => b.total - a.total)
            .map(item => ({ ...item, percent: totalExpenses > 0 ? +((item.total / totalExpenses) * 100).toFixed(2) : 0 }))

        const getWeek = (dateStr: string) => {
            const day = +moment(dateStr).format('D')
            if (day <= 7) return 1
            if (day <= 14) return 2
            if (day <= 21) return 3
            return 4
        }
        type WeekSummary = { week: number; label: string; total: number }
        const weekMap = rawExpenses.reduce<Record<number, WeekSummary>>((acc, item) => {
            const week = getWeek(item.date)
            if (!acc[week]) acc[week] = { week, label: weekLabels[week], total: 0 }
            acc[week].total += item.totalNominal
            return acc
        }, {})
        const weeklyBreakdown = Object.values(weekMap).sort((a, b) => a.week - b.week)

        const topTransactions = topTx.map((item: any) => ({
            ...item,
            day: moment(item.date).format('dddd')
        }))

        const transactionsByCategory = txByCategory.map((item: any) => ({
            type: item.type,
            total: item.total,
            count: item.count,
            percent: totalExpenses > 0 ? +((item.total / totalExpenses) * 100).toFixed(2) : 0,
            transactions: item.transactions
                .sort((a: any, b: any) => b.nominal - a.nominal)
                .map((tx: any) => ({ ...tx, day: moment(tx.date).format('dddd') }))
        }))

        const result = {
            incomeStatus: resolveIncomeStatus(incomeData),
            overview: {
                income: totalIncome,
                budget: totalBudget,
                expenses: totalExpenses,
                savingsByBudget: totalBudget - totalExpenses,
                savingsByIncome: totalIncome - totalExpenses,
                budgetUsedPercent,
                dailyAverage,
                activeDays,
                totalTransactions
            },
            byCategory,
            byFrequency,
            weeklyBreakdown,
            topTransactions,
            transactionsByCategory
        }

        return ApiSuccess('Success', result)
    } catch (error) {
        console.error(error)
        return InternalServerError()
    }
}

export const handleIncomeList = async (token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const MONTH_ORDER: Record<string, number> = {
            january: 1, february: 2, march: 3, april: 4,
            may: 5, june: 6, july: 7, august: 8,
            september: 9, october: 10, november: 11, december: 12
        }

        const raw = await Income.aggregate([
            { $match: { userId: user._id } },
            {
                $group: {
                    _id: { month: '$month', year: '$year' },
                    month: { $first: '$month' },
                    year: { $first: '$year' },
                    totalActual: { $sum: '$actual' },
                    totalBudget: { $sum: '$budget' },
                    count: { $sum: 1 },
                    details: {
                        $push: {
                            id: '$_id',
                            name: '$name',
                            actual: '$actual',
                            budget: '$budget'
                        }
                    }
                }
            },
            { $project: { _id: 0 } }
        ])

        const result = raw
            .sort((a, b) => {
                if (b.year !== a.year) return +b.year - +a.year
                return (MONTH_ORDER[b.month] ?? 0) - (MONTH_ORDER[a.month] ?? 0)
            })
            .map(item => ({
                ...item,
                savings: item.totalActual - item.totalBudget
            }))

        return ApiSuccess('Success', result)
    } catch (error) {
        console.error(error)
        return InternalServerError()
    }
}