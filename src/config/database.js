const mongoose = require('mongoose'); //importing for database

const connectDB = async()=>{
  try{
    await mongoose.connect(process.env.MONGO_URI,{
      useNewUrlParser: true, //it uses new imporved connection string praser
      useUnifiedTopology: true //it uses modern stable mongoDb engine
    });
    console.log('MongoDB is connected.')
  }
catch (error) {
  console.log("MongoDb is not connected. Connection error:", error.message);
  process.exit(1);
}

};

module.exports= connectDB;



//This file handles connecting to MongoDB.
//  Added a function that uses Mongoose to connect to database URL. 