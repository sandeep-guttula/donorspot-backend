import mongoose from "mongoose";
import { MONGODB_URI } from "../SECRET.js";
import colors from "colors";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(MONGODB_URI);
    console.log(
      `MongoDB connected: ${connectionInstance.connection.host}`.cyan
    );
  } catch (error) {
    console.log("MongoDB connection failed".red);
    console.log(`Error: ${error.message}`.red);
    process.exit(1);
  }
};

export { connectDB };
