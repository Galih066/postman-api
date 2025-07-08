import mongoose from "mongoose";
const { Schema, model } = mongoose;

const incomeSchema = new Schema(
    {
        name: String,
        month: String,
        year: String,
        number: { type: Number, required: true },
    },
    { timestamps: true }
);

const Income = model('Income', incomeSchema);

export default Income;