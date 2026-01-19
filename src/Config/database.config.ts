import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const { MONGO_URI, NODE_APP, MONGO_URI_PRD } = process.env;
const connection = async () => {
    try {
        const dbUri = NODE_APP === 'production' ? MONGO_URI_PRD : MONGO_URI;
        // console.log('Node App ', NODE_APP);
        // console.log('URL Connect to ', dbUri);
        const connect = await mongoose.connect(String(dbUri));
        console.log(`MongoDB connected: ${connect.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        // Don't exit - let the app continue running so health checks can pass
        // Routes that need DB will fail gracefully
    }
};

export default connection;