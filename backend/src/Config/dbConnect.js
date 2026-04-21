import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    if (process.env.NODE_ENV !== 'test') {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`Error in mongo connect: ${error.message}`);
    // ← Never call process.exit(1) — it kills Jest
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};