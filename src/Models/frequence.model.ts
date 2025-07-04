import mongoose from "mongoose";
const { Schema, model } = mongoose;

const frequenceSchema = new Schema(
    {
        code: String,
        name: String,
        number: { type: Number, required: true },
    },
    { timestamps: true }
);

const Frequence = model('Frequence', frequenceSchema);

export default Frequence;