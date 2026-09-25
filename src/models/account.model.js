const mongoose = require('mongoose');
const ledgerSchema = require('./ledger.model');

const accountSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true,
        index:true,
    },
    status:{
        type:String,
        enum:{
            values:["ACTIVE","FROZEN","CLOSED"],
            message:"Status Can be either ACTIVE, FROZEN OR CLOSED",
        },
        default:"ACTIVE"
    },
    currency:{
        type:String,
        required:true,
        default:"INR"
    }
},{
    timestamps:true
})

accountSchema.index({user:1,status:1})

/**
 * - Get Balance Method
 * - Returns the balance of the account by aggregating the ledger entries
 */
accountSchema.methods.getBalance = async function(){
    const balance = await ledgerSchema.aggregate([
        {
            $match:{
                account:this._id
            }
        },
        {
            $group:{
                _id:null,
                creditbalance:{$sum:{$cond:[{$eq:["$type","CREDIT"]},"$amount",0]}},
                debitbalance:{$sum:{$cond:[{$eq:["$type","DEBIT"]},"$amount",0]}}
            }
        },{
            $project:{
            _id:0,
            balance:{$subtract:["$creditbalance","$debitbalance"]}
        }}
    ])
    return balance.length>0?balance[0].balance:0;
}

const accountModel = mongoose.model('account',accountSchema);

module.exports = accountModel