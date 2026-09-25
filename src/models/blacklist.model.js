const mongoose = require('mongoose')

const blacklistSchema = new mongoose.Schema({
    token:{
        type:String,
        required:true,
        unique:true,
        index:true
    }
},{timestamps:true})

blacklistSchema.index({createdAt:1},{expireAfterSeconds:60*60*24*3}) // 1 day

const blacklistModel = mongoose.model('blacklist',blacklistSchema)

module.exports = blacklistModel