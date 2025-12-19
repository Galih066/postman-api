import { PipelineStage, Types } from "mongoose";

export const expansesSummaryAggr = (startDate: string, endDate: string, timeZone: string, userId: Types.ObjectId) => [
    {
        $match: {
            date: { $gte: new Date(startDate), $lte: new Date(endDate) },
            userId
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
    {
        $lookup: {
            from: "frequences",
            localField: "frequence",
            foreignField: "code",
            as: "freqName"
        }
    },
    {
        $unwind: "$typeName"
    },
    {
        $unwind: "$freqName"
    },
    {
        $addFields: {
            dateOnly: {
                $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$date",
                    timezone: timeZone
                }
            }
        }
    },
    {
        $group: {
            _id: {
                dateOnly: "$dateOnly",
                type: "$type",
                frequence: "$frequence"
            },
            typeName: { $first: "$typeName.name" },
            freqName: { $first: "$freqName.name" },
            totalNominal: { $sum: "$nominal" },
            count: { $sum: 1 }
        }
    },
    {
        $project: {
            date: "$_id.dateOnly",
            type: "$_id.type",
            freq: "$_id.frequence",
            typeName: 1,
            freqName: 1,
            _id: 0,
            totalNominal: 1,
            count: 1,
        }
    }
];

export const dailyChartAggr = (startDate: string, endDate: string, timeZone: string): PipelineStage[] => [
    {
        $match: {
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
            frequence: { $in: ["FREQ-000", "FREQ-001"] }
        }
    },
    {
        $project: {
            nominal: 1,
            date: 1
        }
    },
    {
        $addFields: {
            dateOnly: {
                $dateToString: {
                    format: "%Y-%m-%d",
                    date: '$date',
                    timezone: timeZone
                }
            }
        }
    },
    {
        $group: {
            _id: { dateOnly: "$dateOnly" },
            date: { $first: "$dateOnly" },
            total: { $sum: "$nominal" }
        }
    },
    {
        $project: { _id: 0 }
    },
    {
        $sort: { date: 1 }
    }
]

export const monthlySummaryAggr = (timeZone: string): PipelineStage[] => [
    {
        $addFields: {
            year: { $year: { date: "$date", timezone: timeZone } },
            month: { $month: { date: "$date", timezone: timeZone } }
        }
    },
    {
        $project: {
            nominal: 1,
            year: 1,
            month: 1
        }
    },
    {
        $group: {
            _id: { year: "$year", month: "$month" },
            total: { $sum: "$nominal" },
            count: { $sum: 1 }
        }
    },
    {
        $project: {
            year: "$_id.year",
            month: "$_id.month",
            total: 1,
            count: 1,
            _id: 0
        }
    }
]

export const monthlyIncomeAggr = (): PipelineStage[] => [
    {
        $group: {
            _id: {
                month: "$month",
                year: "$year"
            },
            income: { $sum: "$actual" },
            budget: { $sum: "$budget" },
            count: { $sum: 1 }
        }
    },
    {
        $project: {
            month: "$_id.month",
            year: "$_id.year",
            income: 1,
            count: 1,
            budget: 1,
            _id: 0
        }
    }
]
