const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("🔄 Connecting to MongoDB...");
        console.log(process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected");
        console.log("Database Name:", mongoose.connection.name);
        console.log("Host:", mongoose.connection.host);

    } catch (error) {
        console.log("❌ Connection Failed");
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectDB;