import express from 'express';
import dotenv from 'dotenv';
import connectDB  from './config/db.js';
import auth from './routes/auth.js';
import cors from 'cors';

const app = express();
dotenv.config()
const PORT = process.env.PORT || 5000;
app.use(express.json())
app.use(cors())

app.use('/api/auth',auth)

connectDB()
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})