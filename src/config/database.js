const mongoose = require('mongoose')


async function connectDB(){
    try {
        await mongoose.connect(process.env.MONGO_URI, { retryWrites: false })
        console.log('Connected to database')
    } catch (error) {
        console.log('error in connecting to database',error)
        process.exit(1)
    }
}

module.exports = connectDB;