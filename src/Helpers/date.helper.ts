import moment from "moment";

export const dateRangeGenerator = (start: string, end: string) => {
    const arrDateRange = [];
    const current = moment(start);
    while (current.isSameOrBefore(end, 'day')) {
        arrDateRange.push(current.format('YYYY-MM-DD'));
        current.add(1, 'day');
    }

    return arrDateRange;
}

export const getMonthBetweenDateRange = (startDate: string, endDate: string) => {
    const start = moment(startDate).startOf('month');
    const end = moment(endDate).startOf('month');
    const current = start.clone();
    const result = [];

    while (current.isSameOrBefore(end)) {
        result.push({
            month: current.format('MMMM').toLowerCase(),
            year: current.format('YYYY')
        });

        current.add(1, 'month');
    }

    return result;
}

export const getDateRangeByArray = (months: { month: string, year: string }[]) => {
    if (!months.length) return {
        start: moment().utc().toISOString(),
        end: moment().utc().toISOString()
    };

    let min = moment();
    let max = moment();

    for (const { month, year } of months) {
        const current = moment(`${month} ${year}`, 'MMMM YYYY', true);

        if (!current.isValid()) throw new Error(`Invalid month/year: ${month} ${year}`);
        if (!min || current.isBefore(min)) min = current;
        if (!max || current.isAfter(max)) max = current;
    }

    const result: { start: string, end: string } = {
        start: min.clone().startOf('month').utc().toISOString(),
        end: max.clone().endOf('month').utc().toISOString()
    }

    return result
}