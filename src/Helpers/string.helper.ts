import jwt from "jsonwebtoken";

const { SECRET_KEY } = process.env;

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const generatingToken = (data: any) => {
    const token = jwt.sign(data, String(SECRET_KEY));
    return token as string
}

export const decodingToken = (token: string) => {
    try {
        const decode = jwt.verify(token, String(SECRET_KEY)) as { context: string, iat: number }
        return decode.context as string
    } catch (error) {
        return null
    }
}