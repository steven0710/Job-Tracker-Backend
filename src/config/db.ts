import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === "development") {
      require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
    }
    const conn = await mongoose.connect(process.env.MONGO_URI || "");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};
