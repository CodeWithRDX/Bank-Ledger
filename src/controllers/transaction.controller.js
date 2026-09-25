const transactionModel = require('../models/transaction.model')
const ledgerModel = require('../models/ledger.model')
const accountModel = require('../models/account.model')
const emailService = require('../utils/email.service')

const mongoose = require('mongoose')

/**
 * - Create Transaction Controller
 * - POST /api/transactions
 * - Request Body: {from, to, amount, idempotencyKey}
 * - Response: {message, transaction}
 */ 
async function createTransaction(req,res){
    const {from,to,amount,idempotencyKey} = req.body
    if(!from || !to || !amount || !idempotencyKey){
        return res.status(400).json({message:'Missing Required Fields'})
    }
    if(from !== req.user.id){
        return res.status(403).json({message:'Unauthorized! You can only create transactions from your own account'})
    }

    const fromAccount = await accountModel.findOne({user:from})
    const toAccount = await accountModel.findOne({user:to})
    if(!fromAccount || !toAccount){
        return res.status(400).json({message:'Invalid Account'})
    }

    const idempotencyCheck = await transactionModel.findOne({idempotencyKey})
    if(idempotencyCheck){
        if(idempotencyCheck.status === 'COMPLETED'){
            return res.status(200).json({message:'Transaction Completed Successfully',transaction:idempotencyCheck})
        }
        if(idempotencyCheck.status === 'PENDING'){
            return res.status(202).json({message:'Transaction is pending'})
        }
        return res.status(500).json({message:'Transaction Failed'})
    }

    if(fromAccount.status !== 'ACTIVE' || toAccount.status !== 'ACTIVE'){
        return res.status(400).json({message:'Account is not active'})
    }
    if(await fromAccount.getBalance() < amount){
        return res.status(400).json({message:`₹${amount} Insufficient Balance`})
    }

    const transaction = await transactionModel.create({
        from:fromAccount._id,
        to:toAccount._id,
        amount,
        idempotencyKey,
        status:'PENDING'
    })

    let session
    try{
        session = await mongoose.startSession()
        session.startTransaction()
        await ledgerModel.create([{
            account:fromAccount._id,
            type:'DEBIT',
            transaction:transaction._id,
            amount
        }],{session})
        await ledgerModel.create([{
            account:toAccount._id,
            type:'CREDIT',
            transaction:transaction._id,
            amount
        }],{session})
        await transactionModel.updateOne({_id:transaction._id},{status:'COMPLETED'},{session})
        await session.commitTransaction()
    }catch(error){
        if(session?.inTransaction()){
            await session.abortTransaction()
        }
        await transactionModel.updateOne({_id:transaction._id},{status:'FAILED'})
        return res.status(500).json({message:'Transaction failed'})
    }finally{
        await session?.endSession()
    }

    transaction.status = 'COMPLETED'
    res.status(201).json({message:'Transaction Completed Successfully',transaction})
    await emailService.sendTransactionEmail(req.user.email,'Transaction Successful','Transaction Successful',`<h1>Transaction Successful</h1><p>₹${amount} has been transferred from your account to ${toAccount._id}</p>`)
}

/**
 * - Deposit Transactions
 * - POST /api/transactions/deposit
 * - Request Body: {toAccount, amount, idempotencyKey}
 * - Response: {message, transaction}
 */

async function depositTransactions(req,res){
    const {toAccount,amount,idempotencyKey} = req.body || {}

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({message:"Missing Required Fields"})
    }
    const user = req.user
    
    const toUser = await accountModel.findOne({user:toAccount});

    if(!toUser){
        return res.status(400).json({message:"Reciever is invalid"});
    }

    const idempotencyCheck = await transactionModel.findOne({idempotencyKey})
    if(idempotencyCheck){
        if(idempotencyCheck.status === 'COMPLETED'){
            return res.status(200).json({message:'Transaction Completed Successfully',transaction:idempotencyCheck})
        }
        if(idempotencyCheck.status === 'PENDING'){
            return res.status(202).json({message:'Transaction is pending'})
        }
        return res.status(500).json({message:'Transaction Failed'})
    }

    const transaction = await transactionModel.create({
        from:user._id,
        to:toAccount,
        amount:amount,
        status:"PENDING",
        idempotencyKey:idempotencyKey
    })

    let session
    try{
        session = await mongoose.startSession()
        session.startTransaction()
        await ledgerModel.create([{
            account:user._id,
            type:"DEBIT",
            transaction:transaction._id,
            amount:amount
        }],{session})
        await ledgerModel.create([{
            account:toUser._id,
            type:"CREDIT",
            transaction:transaction._id,
            amount:amount
        }],{session})
        await transactionModel.updateOne({_id:transaction._id},{status:"COMPLETED"},{session})
        await session.commitTransaction()
    }catch(error){
        if(session?.inTransaction()){
            await session.abortTransaction()
        }
        await transactionModel.updateOne({_id:transaction._id},{status:"FAILED"})
        return res.status(500).json({message:"Transaction failed"})
    }finally{
        await session?.endSession()
    }

    transaction.status = "COMPLETED"
    res.status(201).json({message:"Transaction Completed Successfully",transaction})
    await emailService.sendTransactionEmail(toUser.email,'Transaction Successful','Transaction Successful',`<h1>Transaction Successful</h1><p>₹${amount} has been credited to your account</p>`)
}

/**
 * - Withdrawal Transactions
 * - POST /api/transactions/withdrawal
 * - Request Body: {fromAccount, amount, idempotencyKey}
 * - Response: {message, transaction}
 */

async function withdrawalTransactions(req,res){
    const {fromAccount,amount,idempotencyKey} = req.body
     
    if(!fromAccount || !amount || !idempotencyKey){
        return res.status(400).json({message:"Missing Required Fields"})
    }

    const {id} = req.user

    const user = await accountModel.findOne({user:id}).select("+systemUser")

    if(!user){
        return res.status(403).json({message:"Unauthorized Access"})
    }
    
    const fromUser = await accountModel.findOne({user:fromAccount});

    if(!fromUser){
        return res.status(400).json({message:"Account is invalid"});
    }

    const idempotencyCheck = await transactionModel.findOne({idempotencyKey})
    if(idempotencyCheck){
        if(idempotencyCheck.status === 'COMPLETED'){
            return res.status(200).json({message:'Transaction Completed Successfully',transaction:idempotencyCheck})
        }
        if(idempotencyCheck.status === 'PENDING'){
            return res.status(202).json({message:'Transaction is pending'})
        }
        return res.status(500).json({message:'Transaction Failed'})
    }

    if(await fromUser.getBalance() < amount){
        return res.status(400).json({message:`₹${amount} Insufficient Balance`})
    }

    const transaction = await transactionModel.create({
        from:fromUser._id,
        to:user._id,
        amount:amount,
        status:"PENDING",
        idempotencyKey:idempotencyKey
    })

    let session
    try{
        session = await mongoose.startSession()
        session.startTransaction()
        await ledgerModel.create([{
            account:fromUser._id,
            type:"DEBIT",
            transaction:transaction._id,
            amount:amount
        }],{session})
        await ledgerModel.create([{
            account:user._id,
            type:"CREDIT",
            transaction:transaction._id,
            amount:amount
        }],{session})
        await transactionModel.updateOne({_id:transaction._id},{status:"COMPLETED"},{session})
        await session.commitTransaction()
    }catch(error){
        if(session?.inTransaction()){
            await session.abortTransaction()
        }
        await transactionModel.updateOne({_id:transaction._id},{status:"FAILED"})
        return res.status(500).json({message:"Transaction failed"})
    }finally{
        await session?.endSession()
    }

    transaction.status = "COMPLETED"
    res.status(201).json({message:"Transaction Completed Successfully",transaction})
}

/**
 * - Check Balance
 * - GET /api/transactions/balance
 * - Response: {message, balance}
 */

async function checkBalance(req,res){
    const {id} = req.user
    const user = await accountModel.findOne({user:id})
    if(!user){
        return res.status(404).json({message:"User not found"})
    }
    res.status(200).json({message:"Balance retrieved successfully", balance:await user.getBalance()})
}

module.exports = {createTransaction,depositTransactions,withdrawalTransactions,checkBalance}