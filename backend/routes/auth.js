import express from 'express';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AppConstConfig from '../configs/AppConstConfig.js';
import { authenticateUser } from '../middleware/authenticateUser.js';


const router = express.Router()

// ROUTE:1 Create a user using POST : /api/auth/createuser 
router.post('/register',async (req,res)=>{
        const {email,password,name,role} = req.body

    try {
        const existingUser = await User.findOne({email:email})

        if(existingUser) return res.status(400).json({message:"User already exists"})

        const hashPassword = await bcrypt.hash(password,12)

        const newUser = await User.create({
            email:email,
            password:hashPassword,
            name:name,
            role:role
        })

        const authtoken = jwt.sign({id:newUser._id,role:newUser.role},process.env.JWT_SECRET)

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
                const authtoken = jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET)
                const {password,...others} = user._doc;
                res.status(201).send({...others,authtoken:authtoken,message:'Signed In Successfully',status:1})
            }
            else{
                return res.status(400).send({status:-1,error:"Please enter the correct credentials"})
            }
        } catch (error) {
            res.status(400).json({message:'Internal error occured',status:-1,error:error})
        }
    })

// ROUTE:3 GETTING THE TABLE OF THE NOTES USING api/users/table
router.post('/table',authenticateUser, async(req,res)=>{
    let sortBy, sortOrder;
    req.body.sortOrder === "asc" ? sortOrder = 1 : sortOrder = -1
    if(req.body.sortBy === "col1"){
        sortBy = {name:sortOrder}
    }else if(req.body.sortBy === "col2"){
        sortBy = {email:sortOrder}
    }

    let skipVal = (req.body.page && req.body.page > 0) ? (req.body.page - 1)*(req.body.length) : 0
    let searchStr = (req.body.searchStr && req.body.searchStr!=="") ? req.body.searchStr : ""
    let length = req.body.length
        try {
            let users = await User.find({"$or":[{"name":{$regex:searchStr}}, {"email":{$regex:searchStr}}, {"role":{$regex:searchStr}}]},{"name":1, "role":1, "email":1, "date":1})
                .sort(sortBy)
                .limit(length)
                .skip(skipVal)

            var usersCount = 0;
            if(searchStr && searchStr!==""){
                usersCount = await User.find({"$or":[{"name":{$regex:searchStr}},{"email":{$regex:searchStr}},{"role":{$regex:searchStr}}]}).count()
            }
            else{
                usersCount = await User.find().count()
            }

            res.status(201).json({data:users,recordsFiltered:usersCount,status:1})
        } catch (error) {
            res.status(400).json('Internal server error')
        }
})


export default router 