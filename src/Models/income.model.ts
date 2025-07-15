import mongoose from "mongoose";
const { Schema, model } = mongoose;

const incomeSchema = new Schema(
    {
        name: String,
        month: String,
        year: String,
        actual: { type: Number, required: true },
        budget: { type: Number, required: true },
    },
    { timestamps: true }
);

const Income = model('Income', incomeSchema);

export default Income;