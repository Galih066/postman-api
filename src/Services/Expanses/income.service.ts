import Income from "../../Models/income.model.js";
import {
    AddIncomeIntfc,
    GetIncomeIntfc
} from "../../Interfaces/expanses.interface.js";
import {
    ApiSuccess,
    InternalServerError
} from "../../Helpers/response.helper.js";

export const addIncome = async (params: AddIncomeIntfc) => {
    try {
        const incomeData = new Income(params);
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
            .find({ month: params.month, year: params.year })
            .select('number name');
        const total = incomeData.reduce((acc, item) => (acc + item.number), 0);
        const result = { total, details: incomeData };

        return ApiSuccess("Success", result);
    } catch (error) {
        console.error(error)
        return InternalServerError();
    }
}