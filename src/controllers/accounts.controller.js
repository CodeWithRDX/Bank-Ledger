const accountModel = require('../models/account.model')


async function createAccount(req,res){
    const user = req.user

    const existingAccount = await accountModel.findOne({user:user._id})

    if(existingAccount){
        return res.status(400).json({message:"Account Already Exists for this user"})
    }

    const account = await accountModel.create({
        user:user._id,
    })

    if(!account){
        return res.status(400).json({message:"Account Creation Failed.. Try Again!"})
    }

    res.status(201).json({
        message:"Account Created successFully",
        account
    })
}
async function getAllAccounts(req,res){
    const user = req.user
    
    const accounts = await accountModel.find({user:user._id})

    res.status(200).json({
        message:"Accounts Fetched Successfully",
        accounts
    })
}
module.exports = {createAccount,getAllAccounts}