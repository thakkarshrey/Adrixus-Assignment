import mongoose from 'mongoose';

const connectDB = async () =>{ 
    mongoose.set("strictQuery", false);
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
        console.log(`MongoDB connected: ${connect.connection.host}`)
    } catch (error) {
        console.log(`Error: ${error}`)
        process.exit()
    }
}

export default connectDB