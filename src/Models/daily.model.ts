import mongoose from "mongoose";
const { Schema, model } = mongoose;

const dailyExpanseSchema = new Schema(
    {
        userId: Schema.Types.ObjectId,
        name: String,
        description: String,
        nominal: Number,
        type: String,
        frequence: String,
        date: Date
    },
    { timestamps: true }
);

const DailyExpanse = model('DailyExpanse', dailyExpanseSchema);

export default DailyExpanse;