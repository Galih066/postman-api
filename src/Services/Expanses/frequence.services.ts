import Frequence from "../../Models/frequence.model.js";
import { InternalServerError, ApiSuccess } from "../../Helpers/response.helper.js";

export const getAllFrequence = async () => {
    try {
        const raw = await Frequence.find({});
        return ApiSuccess("Success", raw);
    } catch (error) {
        console.error(error);
        return InternalServerError();
    };
};