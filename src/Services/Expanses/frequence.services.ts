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

export const handleAddFrequences = async (params: any) => {
    try {
        const existingType = await Frequence
            .findOne()
            .select('number')
            .sort({ createdAt: -1 });
        const initial: string = existingType ? `${existingType.number + 1}` : `0`;
        const number: number = existingType ? existingType.number + 1 : 0;
        const code: string = `FREQ-${initial.padStart(3, "0")}`;
        const savedData = new Frequence({
            code,
            name: params.name,
            number
        });
        await savedData.save();

        return ApiSuccess("Success");
    } catch (error) {
        console.error(error)
        return InternalServerError();
    };
};