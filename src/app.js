import express from 'express';  
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();

//app.use(cors());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"})); //like data coming from form and all

//data coming from url (url store +,% and all) so we need to parse it
app.use(express.urlencoded({extended: true, limit: "16kb"})); //like data coming from url

//if you want to store images/pdf on your server so public folder is there
app.use(express.static("public"));

app.use(cookieParser());



export { app }
