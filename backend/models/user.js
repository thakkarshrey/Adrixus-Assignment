import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role:{type:String, default:"user",enum:["admin","user"]},
  date:{ type:Date, default: Date.now}
}); 

export default mongoose.model("User", userSchema);
