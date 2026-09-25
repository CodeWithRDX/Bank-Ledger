const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const tokenBlacklistModel = require('../models/blacklist.model')

async function authMiddleware(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

    if(!token){
        return res.status(401).json({message:'Unauthorized! Acess Token is missing'})
    }
    const isBlacklisted = await tokenBlacklistModel.findOne({token})
    if(isBlacklisted){
        return res.status(401).json({message:'Unauthorized! Token is blacklisted'})
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
        const user = await userModel.findById(decoded.id)
        if(!user){
            return res.status(401).json({message:'Unauthorized'})
        }
        req.user = user
        next()
    }catch(err){
        return res.status(401).json({message:'Unauthorized'})
    }
}

async function systemAuthMiddleware(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]
    
    if(!token){
        return res.status(401).json({message:'Unauthorized! Acess Token is missing'})
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({token})
    if(isBlacklisted){
        return res.status(401).json({message:'Unauthorized! Token is blacklisted'})
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        const user = await userModel.findById(decoded.id).select("+systemUser");

        if(!user || !user.systemUser){
            return res.status(401).json({message:'Unauthorized'})
        }
        req.user = user
        next()
    }catch(err){
        return res.status(401).json({message:'Unauthorized'})
    }
}

module.exports = {
    authMiddleware,
    systemAuthMiddleware
}