import mongoose from "mongoose";
const { Schema, model } = mongoose;

const eventHistorySchema = new Schema(
    {
        startedAt: { type: Date, required: true },
        endedAt: { type: Date, required: true },
    },
    { _id: false }
);

const eventSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        description: { type: String, default: '' },
        startedAt: { type: Date, required: true },
        targetDays: { type: Number, default: null },
        history: { type: [eventHistorySchema], default: [] },
    },
    { timestamps: true }
);

eventSchema.index({ userId: 1, startedAt: 1 });

const Event = model('Event', eventSchema);

export default Event;
