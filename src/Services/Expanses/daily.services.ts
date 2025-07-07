import moment from "moment";
import {
    DailyExpnsIntfc,
    GetDailyExpIntfc
} from "../../Interfaces/expanses.interface.js";
import { InternalServerError, ApiSuccess } from "../../Helpers/response.helper.js";
import DailyExpanse from "../../Models/daily.model.js";

export const handleDailyExpanses = async (params: DailyExpnsIntfc) => {
    try {
        const savedData = new DailyExpanse({
            ...params,
            date: moment(params.date).format('YYYY-MM-DD HH:mm:ss')
        });
        await savedData.save();
        return ApiSuccess("Success")
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}

export const getDailyExpanses = async ({ start, end }: GetDailyExpIntfc) => {
    try {
        const startDate = moment(start).startOf("days").format('YYYY-MM-DD HH:mm:ss')
        const endDate = moment(end).endOf("days").format('YYYY-MM-DD HH:mm:ss')
        const dailyData = await DailyExpanse.find({
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        });

        return ApiSuccess("Success", dailyData);
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}