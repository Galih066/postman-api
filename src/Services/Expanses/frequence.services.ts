import Frequence from "../../Models/frequence.model.js";
import { InternalServerError, ApiSuccess, NotFound } from "../../Helpers/response.helper.js";
import { findUserByUniqueKey } from "../../Helpers/data.helper.js";
import { decodingToken } from "../../Helpers/string.helper.js";

export const getAllFrequence = async (token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const raw = await Frequence.find({ userId: user._id });

        return ApiSuccess("Success", raw);
    } catch (error) {
        console.error(error);
        return InternalServerError();
    };
};

export const handleAddFrequences = async (params: any, token: string) => {
    try {
        const uniqueKey = decodingToken(token)
        const user = await findUserByUniqueKey(String(uniqueKey))

        if (!user) return NotFound('User not found')

        const existingType = await Frequence
            .findOne({ userId: user._id })
            .select('number')
            .sort({ createdAt: -1 });
        const initial: string = existingType ? `${existingType.number + 1}` : `0`;
        const number: number = existingType ? existingType.number + 1 : 0;
        const code: string = `FREQ-${initial.padStart(3, "0")}`;
        const savedData = new Frequence({
            userId: user._id,
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