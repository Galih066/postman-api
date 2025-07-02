import { DailyExpnsIntfc } from "../../Interfaces/expanses.interface.js";
import { InternalServerError, ApiSuccess } from "../../Helpers/response.helper.js";
import DailyExpanse from "../../Models/daily.model.js";

export const handleDailyExpanses = async (params: DailyExpnsIntfc) => {
    try {
        const savedData = new DailyExpanse(params);
        await savedData.save();
        return ApiSuccess("Success")
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}