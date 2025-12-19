import User from "../Models/user.model.js"

export const findUserByUniqueKey = async (uniqueKey: string) => {
    const raw = await User.findOne({ uniqueKey })
    return raw
}