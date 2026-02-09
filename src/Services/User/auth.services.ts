import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { randomBytes } from "crypto";
import User from "../../Models/user.model.js";
import Profile from "../../Models/profile.model.js";
import Income from "../../Models/income.model.js";
import Frequence from "../../Models/frequence.model.js";
import Type from "../../Models/type.model.js";
import { LoginIntfc, AddProfileIntfc } from "../../Interfaces/user.interface.js";
import {
    InternalServerError,
    ApiSuccess,
    BadRequest
} from "../../Helpers/response.helper.js";
import {
    generatingToken,
    decodingToken,
    capitalize
} from "../../Helpers/string.helper.js";
import moment from "moment";

const LENGTH_ROUND: number = 12;

export const handleLogin = async (params: LoginIntfc) => {
    try {
        const foundUser = await User.findOne({ email: params.email });
        const validPassword = await bcrypt.compare(params.password, foundUser?.password!);

        if (!foundUser || !validPassword) return BadRequest('Email and Password not match any user');

        const token = generatingToken({ context: foundUser.uniqueKey })
        const result = { email: foundUser.email, token };
        return ApiSuccess("Success", result);
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}

export const handleRegister = async (params: LoginIntfc) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userExist = await User.findOne({ email: params.email });
        if (userExist) return BadRequest('User with this email already exist');

        const hashedPwd = await bcrypt.hash(params.password, LENGTH_ROUND);
        const randomByt: string = randomBytes(32).toString('hex');
        const registerData = new User({
            email: params.email,
            password: hashedPwd,
            uniqueKey: randomByt,
        });

        await registerData.save({ session });

        const newUserId = registerData._id;
        const incomeData = new Income({
            userId: newUserId,
            name: "Sallary",
            month: moment().format('MMMM').toLowerCase(),
            year: moment().format('YYYY'),
            actual: 0,
            budget: 5000000
        });

        await incomeData.save({ session });

        const freqData = [
            {
                userId: newUserId,
                code: "FREQ-001",
                name: "Daily",
                number: 1
            },
            {
                userId: newUserId,
                code: "FREQ-003",
                name: "Weekly",
                number: 2
            },
            {
                userId: newUserId,
                code: "FREQ-002",
                name: "Monthly",
                number: 3
            }
        ];

        await Frequence.insertMany(freqData, { session })

        const typeData = [
            {
                userId: newUserId,
                code: "TYPE-000",
                name: "Food & Drinks",
                number: 0,
                description: "Lorem ipusm dolor sit amet"
            },
            {
                userId: newUserId,
                code: "TYPE-001",
                name: "Housing & Rents",
                number: 1,
                description: "Lorem ipusm dolor sit amet"
            },
            {
                userId: newUserId,
                code: "TYPE-002",
                name: "Traveling",
                number: 2,
                description: "Lorem ipusm dolor sit amet"
            },
            {
                userId: newUserId,
                code: "TYPE-003",
                name: "Gift & Donation",
                number: 3,
                description: "Lorem ipusm dolor sit amet"
            },
            {
                userId: newUserId,
                code: "TYPE-004",
                name: "Utilities",
                number: 4,
                description: "Lorem ipusm dolor sit amet"
            },
            {
                userId: newUserId,
                code: "TYPE-005",
                name: "Shopping",
                number: 5,
                description: "Lorem ipusm dolor sit amet"
            }
        ];

        await Type.insertMany(typeData, { session })

        await session.commitTransaction();
        return ApiSuccess("Success");
    } catch (error) {
        console.log(error);
        await session.abortTransaction();
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

export const addNewProfile = async (params: AddProfileIntfc) => {
    try {
        const userId = decodingToken(params.userId)
        const foundUser = await User.findOne({ uniqueKey: userId })

        if (!foundUser) return BadRequest('User not found');

        const foundProfl = await Profile.findOne({ userId: foundUser?._id })
        const profileData = {
            userId: foundUser._id,
            name: capitalize(params.name),
            gender: params.gender,
            phone: params.phone,
            address: capitalize(params.address),
        }

        if (foundProfl) {
            const { userId, ...rest } = profileData;
            await Profile.updateOne({ userId: foundUser._id }, rest);
        } else {
            const profileInstc = new Profile(profileData);
            await profileInstc.save();
        }

        return ApiSuccess("Success")
    } catch (error) {
        console.log(error);
        return InternalServerError();
    }
}