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