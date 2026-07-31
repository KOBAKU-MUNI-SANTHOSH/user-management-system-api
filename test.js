const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://kobakumunisanthosh7_db_user:MONGODB0000@cluster0.pvb3bcs.mongodb.net/backend_bootcamp?retryWrites=true&w=majority"
)
.then(() => {
    console.log("✅ Connected");
    process.exit(0);
})
.catch((err) => {
    console.log("❌ Failed");
    console.error(err);
});