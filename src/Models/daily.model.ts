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

dailyExpanseSchema.index({ userId: 1, createdAt: -1 });
dailyExpanseSchema.index({ createdAt: -1 });
dailyExpanseSchema.index({ type: 1 });
dailyExpanseSchema.index({ frequence: 1 });
dailyExpanseSchema.index({ type: 1, createdAt: -1 });
dailyExpanseSchema.index({ userId: 1, type: 1, createdAt: -1 });

const DailyExpanse = model('DailyExpanse', dailyExpanseSchema);

export default DailyExpanse;