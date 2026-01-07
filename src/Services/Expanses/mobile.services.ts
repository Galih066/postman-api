import moment from "moment";
import { ApiSuccess, InternalServerError, NotFound } from "../../Helpers/response.helper.js"
import { GetDailyExpIntfc } from "../../Interfaces/expanses.interface.js";
import { getMonthBetweenDateRange } from "../../Helpers/date.helper.js";
import { decodingToken } from "../../Helpers/string.helper.js";
import { findUserByUniqueKey } from "../../Helpers/data.helper.js";
import { DEFDATEFORMAT } from "../../utils/constants.js";
import DailyExpanse from "../../Models/daily.model.js";
import Income from "../../Models/income.model.js";

export const handleDateRangeMobile = async (params: GetDailyExpIntfc, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const start = moment(params.start).startOf('days').format('YYYY-MM-DD HH:mm:ss');
        const end = moment(params.end).endOf('days').format('YYYY-MM-DD HH:mm:ss');
        const rawMonthRange = getMonthBetweenDateRange(start, end).sort((a, b) => {
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