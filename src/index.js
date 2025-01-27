//require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from './db/index.js';
import {app} from './app.js'

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})


















// Connect to MongoDB
//not a good practice since db is in another continent
//use try catch and async await for better error handling
//mongoose.connect(`mongodb://localhost/${DB_NAME}`, {


/*
//this approach is good but index.js file is polluted

import express from 'express';
const app = express();

// ()() is a self invoking function used below 
( async () => {
    try {
        await mongoose.connect(`${process.env.
        MONGO_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log('Error connecting to MongoDB:', error);
            throw error;
        });
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });  
    } catch (error) {
        console.log('Error connecting to MongoDB:', error);
        throw error;
    }
})()


*/