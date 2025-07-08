export const expansesSummaryAggr = (startDate: string, endDate: string, timeZone: string) => [
    {
        $match: {
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
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
        $unwind: "$typeName"
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
            _id: 0,
            totalNominal: 1,
            count: 1,
        }
    }
]