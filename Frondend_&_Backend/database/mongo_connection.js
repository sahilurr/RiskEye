import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DBNAME}`)

        console.log("CONNECTION TO MONGODB ESTABLISHED!!!");
        console.log(`MongoDB connected at ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB Connection failed.");
        console.log(`Error: ${error}`);
        process.exit();
    }
}

export default connectDB;