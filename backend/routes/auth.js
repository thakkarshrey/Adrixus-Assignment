import express from 'express';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AppConstConfig from '../configs/AppConstConfig.js';


const router = express.Router()

// ROUTE:1 Create a user using POST : /api/auth/createuser 
router.post('/register',async (req,res)=>{
        // try {
        //     // use let here or otherwise you wont be able to asign new user
        //     let user = await User.findOne({email:req.body.email})

        //     if(user){
        //         return res.status(400).send({status:AppConstConfig.APP_DEFAULT_INVALID_RESPONSE,error:AppConstConfig.APP_USER_NOT_VALID_MESSAGE})
        //     }
        //     // Using bcryptjs to generate salt and hash for password

        //     const salt = await bcrypt.genSalt(10);
        //     console.log(salt,'salt')
        //     const secretPass = await bcrypt.hash(req.body.password,12); 
        //     console.log(secretPass,'secretPass')
        //     // Method:2
        //         const newUser = await User.create({
        //             name:req.body.name,
        //             email:req.body.email,
        //             password:secretPass,
        //         })

        //         console.log('user after created',newUser)
        //         // Creating an authentication token

        //         const authtoken = jwt.sign({id:user._id},process.env.JWT_SECRET)
        //         console.log({...newUser,'authtoken':authtoken,'message':'Registered Successfully','status':1})

        //         res.status(201).json({...newUser,authtoken:authtoken,message:'Registered Successfully',status:1})

        // } catch (error) {
        //     res.status(400).json({message:'Internal error occured',status:-1,error:error})
        // }
        const {email,password,name} = req.body

    try {
        const existingUser = await User.findOne({email:email})

        if(existingUser) return res.status(400).json({message:"User already exists"})

        const hashPassword = await bcrypt.hash(password,12)

        const newUser = await User.create({
            email:email,
            password:hashPassword,
            name:name
        })

        const authtoken = jwt.sign({id:newUser._id},process.env.JWT_SECRET)

        res.status(200).json({...newUser._doc, authtoken:authtoken, message:'Registered Successfully', status:1})
    } catch (error) {
        res.status(500).json("Something went wrong",error)
    }
})

// ROUTE:2 Login a user authentication using POST : /api/auth/ 
router.post('/', async(req,res)=>{
        try {
            let user = await User.findOne({email:req.body.email})
            if(!user){
                return res.status(400).send({status:-1,error:"Please enter the correct credentials"})
            }

            const isValidPassword = await bcrypt.compare(req.body.password,user.password)
            if(isValidPassword){
                const authtoken = jwt.sign({id:user._id},process.env.JWT_SECRET)
                const {password,...others} = user._doc;
                res.status(201).send({...others,authtoken:authtoken,message:'Signed In Successfully',status:1})
            }
            else{
                return res.status(400).send({status:-1,error:"Please enter the correct credentials"})
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({message:'Internal error occured',status:-1,error:error})
        }
    })


export default router 