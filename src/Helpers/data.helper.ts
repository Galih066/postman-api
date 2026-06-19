import User from "../Models/user.model.js"
import { decodingToken } from "./string.helper.js"

export const findUserByUniqueKey = async (uniqueKey: string) => {
    const raw = await User.findOne({ uniqueKey })
    return raw
}

export const resolveUser = async (token: string) => {
    const uniqueKey = decodingToken(token)
    return findUserByUniqueKey(String(uniqueKey))
}