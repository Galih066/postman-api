import moment from 'moment-timezone';
import Income from "../../Models/income.model.js";
import User from '../../Models/user.model.js';
import {
    AddIncomeIntfc,
    GetIncomeIntfc
} from "../../Interfaces/expanses.interface.js";
import {
    ApiSuccess,
    InternalServerError
} from "../../Helpers/response.helper.js";
import { DEFDATEFORMAT } from '../../utils/constants.js';

export const addIncome = async (params: AddIncomeIntfc) => {
    try {
        const dataToSave = { ...params, month: params.month.toLowerCase() }
        const incomeData = new Income(dataToSave);
        await incomeData.save();

        return ApiSuccess("Success");
    } catch (error) {
        console.error(error)
        return InternalServerError();
    }
}

export const getIncome = async (params: GetIncomeIntfc) => {
    try {
        const incomeData = await Income
            .find({ month: params.month.toLowerCase(), year: params.year })
            .select('number name actual budget');
        const totalIncome = incomeData.reduce((acc, item) => (acc + item.actual), 0);
        const budgetTreshold = incomeData.reduce((acc, item) => (acc + item.budget), 0);
        const result = {
            totalIncome,
            budgetTreshold,
            details: incomeData
        };

        return ApiSuccess("Success", result);
    } catch (error) {
        console.error(error)
        return InternalServerError();
    }
}

export const addDefaultIncome = async () => {
    try {
        console.info('Add default income schedule is running', moment().format(DEFDATEFORMAT));
        const user = await User.find({}).select('_id')
        const userId = user.map(item => item._id)
        const month = moment().format('MMMM').toLowerCase()
        const year = moment().format('YYYY')
        const data = userId.map(item => ({
            userId: item,
            name: 'Sallary',
            month,
            year,
            actual: 0,
            budget: 5000000
        }))
        const existingIncome = await Income.find({ month, year }).select('userId');
        const existingUserIds = existingIncome.map(item => item.userId?.toString());
        const newData = data.filter(item => !existingUserIds.includes(item.userId.toString()));

        if (newData.length > 0) {
            await Income.insertMany(newData);
            console.log(`Inserted ${newData.length} new income records`);
        } else {
            console.log('All users already have income records for this month');
        }

        return ApiSuccess("Success", { inserted: newData.length });
    } catch (error) {
        console.error('Error on [addDefaultIncome] schedule. Please check log!', error)
        return InternalServerError();
    }
}