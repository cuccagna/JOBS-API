import mongoose from "mongoose";
import { info, success, error, warning } from "../colors.js";
import "dotenv/config";

export function handleDBConnect(startServer) {
  const database = mongoose.connection;

  database.once("connected", () => {
    info("Database connected", "bold");
    startServer(process.env.MONGO_URI);
  });

  database.on("error", (err) => {
    error("Error about database", "bold");
    error(err);
  });

  connectToDB(process.env.MONGO_URI);
}

async function connectToDB(connectionString) {
  try {
    await mongoose.connect(connectionString);
  } catch (err) {
    error("Could not Connect to Database", "bold");
    error(err);
  }
}
