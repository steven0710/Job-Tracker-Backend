import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/db";
const startServer = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    await connectDB();

    // 2️⃣ Handle Express errors
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    server.on("error", (error: NodeJS.ErrnoException) => {
      console.error(`Error: ${error}`);
      process.exit(1);
    });

    // 3️⃣ Start the server
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

// Call the function to start the server
startServer();
