import mongoose from "mongoose";
const { Schema, model } = mongoose;

const typeSchema = new Schema(
    {
        code: String,
        name: String,
        number: { type: Number, required: true },
        description: String,
    },
    { timestamps: true }
);

const Type = model('Type', typeSchema);

export default Type;