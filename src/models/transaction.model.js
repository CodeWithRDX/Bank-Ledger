const mongoose = require('mongoose');

const accountSchema= new mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:true,
        index:true
    },to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:true,
        index:true
    },status:{
        type:String,
        enum:["PENDING","COMPLETED","FAILED","REVERSED"],
        default:"PENDING"
    },amount:{
        type:Number,
        required:[true,"amount is required"],
        min:[0,"amount must me greater than 0"]
    },idempotencyKey:{
        type:String,
        unique:[true,"Idempotent key must be unique"],
        required:[true,"Idempotent key is required"],
        index:true
    }
},{
    timestamps:true
})

const transactionModel = mongoose.model('transaction',accountSchema);

module.exports = transactionModel