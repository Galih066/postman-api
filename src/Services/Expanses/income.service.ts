import Income from "../../Models/income.model.js";
import {
    ApiSuccess,
    InternalServerError
} from "../../Helpers/response.helper.js";

export const addIncome = async (params: any) => {
    try {
        const incomeData = new Income(params);
        await incomeData.save();

        return ApiSuccess("Success");
    } catch (error) {
        console.error(error)
        return InternalServerError();
    }
}