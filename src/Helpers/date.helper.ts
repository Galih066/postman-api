import moment from "moment";
import { DEFDATEFORMAT } from "../utils/constants.js";

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

    const result = [];

    while (start.isSameOrBefore(end)) {
        result.push({
            month: start.format('MMMM').toLowerCase(),
            year: start.format('YYYY')
        });

        start.add(1, 'month');
    }

    return result;
}

export const getDateRangeByArray = (months: { month: string, year: string }[]) => {
    if (!months.length) return {
        start: moment().toString(),
        end: moment().toString()
    };

    let min = moment();
    let max = moment();

    for (const { month, year } of months) {
        const current = moment
            .utc(`${month} ${year}`, 'MMMM YYYY', true);

        if (!current.isValid()) {
            throw new Error(`Invalid month/year: ${month} ${year}`);
        }

        if (!min || current.isBefore(min)) min = current;
        if (!max || current.isAfter(max)) max = current;
    }

    const result: { start: string, end: string } = {
        start: min.clone().utc().startOf('month').format(DEFDATEFORMAT),
        end: max.clone().utc().endOf('month').format(DEFDATEFORMAT)
    }

    return result
}