import moment from "moment";
import { DailyExpnsIntfc } from "../../Interfaces/expanses.interface.js";
import { InternalServerError, ApiSuccess } from "../../Helpers/response.helper.js";
import DailyExpanse from "../../Models/daily.model.js";

export const handleDailyExpanses = async (params: DailyExpnsIntfc) => {
    try {
        const savedData = new DailyExpanse({ ...params, date: moment(params.date).format('YYYY-MM-DD HH:mm:ss') });
        await savedData.save();
        return ApiSuccess("Success")
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}

export const getDailyExpanses = async () => {
    try {
        const start = moment().startOf("days").format('YYYY-MM-DD HH:mm:ss')
        const end = moment().endOf("days").format('YYYY-MM-DD HH:mm:ss')
        const dailyData = await DailyExpanse.find({
            date: {
                $gte: new Date(start),
                $lte: new Date(end)
            }
        });

        return ApiSuccess("Success", dailyData);
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}