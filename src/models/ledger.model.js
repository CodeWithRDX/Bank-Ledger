const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true,"Ledger must be associated with an account"],
        index:true,
        immutable:true
    }, amount:{
        type:Number,
        required:true,
        immutable:true
    },transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'transactions',
        required:[true,"Ledger must be associated with a transaction"],
        immutable:true,
        index:true
    },type:{
        type:String,
        enum:["CREDIT","DEBIT"],
        required:[true,"Ledger type is required"],
        immutable:true
    }
},{
    timestamps:true
})


function preventLedgerModification(){
    throw new Error("Ledger Modification is not allowed")
}

ledgerSchema.pre('findOneAndDelete',preventLedgerModification)
ledgerSchema.pre('findOneAndUpdate',preventLedgerModification)
ledgerSchema.pre('updateOne',preventLedgerModification)
ledgerSchema.pre('updateMany',preventLedgerModification)
ledgerSchema.pre('deleteOne',preventLedgerModification)
ledgerSchema.pre('deleteMany',preventLedgerModification)
ledgerSchema.pre('delete',preventLedgerModification)
ledgerSchema.pre('update',preventLedgerModification)
ledgerSchema.pre('findOneAndReplace',preventLedgerModification)

const ledgerModel = mongoose.model("ledger",ledgerSchema);

module.exports = ledgerModel
