let mongoose = require('mongoose');


<<<<<<< HEAD
let mongoDB =  ("mongodb+srv://"+
                 process.env.DB_USERNAME+
                 ":"
                 +process.env.DB_PASSWORD+
                 "@"
                 +process.env.HOST+
                 "/"
                 +process.env.DATABASE+
=======
let mongoDB = ("mongodb+srv://"+
                 process.env.DB_USERNAME+
                 ":"+
                 process.env.DB_PASSWORD+
                 "@"+
                 process.env.HOST+
                 "/"+
                 process.env.DATABASE+
>>>>>>> b1dba84 (ability to change from to admin and updated times)
                "?retryWrites=true&w=majority");
console.log(mongoDB);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongoDB, {
            
          });
      
          console.log('MongoDB connected: ${conn.connection.host}');
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}



module.exports = { connectDB };
