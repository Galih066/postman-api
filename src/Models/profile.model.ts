import mongoose from "mongoose";
const { Schema, model } = mongoose;

const profileSchema = new Schema(
    {
        userId: Schema.Types.ObjectId,
        name: String,
        gender: String,
        phone: String,
        address: String,
    },
    { timestamps: true }
);

const Profile = model('Profile', profileSchema);

export default Profile;