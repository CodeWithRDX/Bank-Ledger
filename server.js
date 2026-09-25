require('dotenv').config()
const app = require('./src/app')
const connectDB = require('./src/config/database')

connectDB()

app.listen(process.env.PORT,()=>{
    console.log(`Server is Running on http://localhost:${process.env.PORT}`)
})