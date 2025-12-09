require('dotenv').config();
let mongoose = require('mongoose');

let mongoDB =  ("mongodb+srv://"+
                 process.env.DB_USERNAME+
                 ":"
                 +process.env.DB_PASSWORD+
                 "@"
                 +process.env.HOST+
                 "/"
                 +process.env.DATABASE+
                "?retryWrites=true&w=majority");
console.log(mongoDB + " hi ");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongoDB);
          console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

module.exports = { connectDB };
