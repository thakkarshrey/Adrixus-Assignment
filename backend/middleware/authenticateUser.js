import jwt from 'jsonwebtoken';

export const authenticateUser = (req,res,next) => {
    const token = req.header('token')
    if(!token){
        res.status(401).json('Access Denied. User is not authenticated.')
    }
    try {
       jwt.verify(token, process.env.JWT_SECRET, (error, user)=>{
        if(user.role === "admin"){
            next()
        }
        else{
            res.status(403).json('You are not authorized to access this information')
        }
       })
    } catch (error) {
        
    }
}