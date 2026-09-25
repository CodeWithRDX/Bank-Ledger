const userModel = require('../models/user.model')
const blacklistModel = require('../models/blacklist.model')
const jwt = require('jsonwebtoken')

const emailService = require('../utils/email.service')
/**
 * - Register User Controller
 * - POST /api/auth/register
 */
async function registerUserControler(req,res){
    const {email,name,password} = req.body;

    const isExists = await userModel.findOne({email})

    if(isExists){
        return res.status(409).json({message:'User Already Exists with email'})
    }

    const user = await userModel.create({
        email:email,
        name:name,
        password:password
    })

    const token = jwt.sign({id:user._id,email:email,name:name},process.env.JWT_SECRET_KEY,{expiresIn:'3d'})

    res.cookie("token",token);
    res.status(201).json({message:"User Registered Successfully",user})
    await emailService.sendRegistrationEmail(email,'Welcome to Bank Ledger','Welcome to Bank Ledger','<h1>Welcome to Bank Ledger</h1><p>Thank you for registering with us.</p>')
}

async function loginController(req,res){
    const {email,password} = req.body

    const user = await userModel.findOne({email:email}).select("+password")

    if(!user){
        return res.status(401).json({message:"Invalid Credentials"})
    }

    const isValidPassword = await user.comparePassword(password)

    if(!isValidPassword){
        return res.status(401).json({message:"Invalid Credentials"})
    }

    const token = await jwt.sign({id:user._id,email:user.email,name:user.email},process.env.JWT_SECRET_KEY,{expiresIn:'3d'})

    res.cookie("token",token)
    return res.status(200).json({message:'Logged SuccessFully',token})
}
async function logoutController(req,res){
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]
    if(!token){
        return res.status(400).json({message:'Token is missing'})
    }
    await blacklistModel.create({token})

    res.clearCookie("token")
    return res.status(200).json({message:'Logged Out SuccessFully'})
}
module.exports = {registerUserControler,loginController,logoutController}