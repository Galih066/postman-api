import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../Models/user.model.js";
import { LoginIntfc, UserIntfc } from "../../Interfaces/user.interface.js";
import {
    InternalServerError,
    ApiSuccess,
    BadRequest
} from "../../Helpers/response.helper.js";
import Profile from "../../Models/profile.model.js";
import { randomBytes } from "crypto";
const LENGTH_ROUND: number = 12;
const { SECRET_KEY } = process.env;

export const handleLogin = async (params: LoginIntfc) => {
    try {
        const foundUser = await User.findOne({ email: params.email });
        const validPassword = await bcrypt.compare(params.password, foundUser?.password!);

        if (!foundUser || !validPassword) return BadRequest('Email and Password not match any user');

        const token = jwt.sign({ context: foundUser.uniqueKey }, String(SECRET_KEY));
        const result = { email: foundUser.email, token };
        return ApiSuccess("Success", result);
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}

export const handleRegister = async (params: LoginIntfc) => {
    try {
        const userExist = await User.findOne({ email: params.email });
        if (userExist) return BadRequest('User with this email already exist');

        const hashedPwd = await bcrypt.hash(params.password, LENGTH_ROUND);
        const randomByt: string = randomBytes(32).toString('hex')
        const savedData = new User({
            email: params.email,
            password: hashedPwd,
            uniqueKey: randomByt,
        });

        await savedData.save();

        return ApiSuccess("Success");
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}

export const getUser = async (params: string) => {
    try {
        const userExist = await User.findOne({ uniqueKey: params })

        if (!userExist) return BadRequest('User not found');

        const profile = await Profile.findOne({ userId: userExist._id })
        const result = {
            email: userExist.email,
            profile: profile
                ? {
                    name: profile?.name,
                    gender: profile?.gender,
                    phone: profile?.phone,
                    address: profile?.address
                }
                : null
        }

        return ApiSuccess("Success", result);
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}