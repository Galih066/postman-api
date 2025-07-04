import Type from "../../Models/type.model.js";
import { InternalServerError, ApiSuccess } from "../../Helpers/response.helper.js";

export const handleAddCategory = async (params: any) => {
    try {
        const existingType = await Type
            .findOne()
            .select('number')
            .sort({ createdAt: -1 });
        const initial: string = existingType ? `${existingType.number + 1}` : `0`;
        const number: number = existingType ? existingType.number + 1 : 0;
        const code: string = `TYPE-${initial.padStart(3, "0")}`;
        const savedData = new Type({
            code,
            name: params.name,
            number,
            description: params.description
        });
        await savedData.save();

        return ApiSuccess("Success");
    } catch (error) {
        console.error(error)
        return InternalServerError();
    };
};

export const handleAllType = async () => {
    try {
        const raw = await Type.find();
        return ApiSuccess("Success", raw);
    } catch (error) {
        console.error(error)
        return InternalServerError();
    }
}