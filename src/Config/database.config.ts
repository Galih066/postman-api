import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const { MONGO_URI, NODE_APP, MONGO_URI_PRD } = process.env;

// Throws on failure so the caller can stop the process instead of running without a database
const connection = async () => {
    const isProduction = NODE_APP === 'production';
    const envName = isProduction ? 'MONGO_URI_PRD' : 'MONGO_URI';
    const dbUri = isProduction ? MONGO_URI_PRD : MONGO_URI;

    if (!dbUri) {
        throw new Error(`${envName} is not set (NODE_APP=${NODE_APP ?? '<unset>'}, cwd=${process.cwd()}). Check the .env file.`);
    }

    const connect = await mongoose.connect(dbUri);
    console.log(`MongoDB connected: ${connect.connection.host} (NODE_APP=${NODE_APP ?? '<unset>'})`);
};

export default connection;
