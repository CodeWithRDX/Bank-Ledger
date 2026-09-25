const cookieParser = require('cookie-parser')
const express = require('express')


const authRouter = require('./routes/auth.routes')
const accountsRouter = require('./routes/accounts.routes')
const transactionRouter = require('./routes/transaction.routes')


const app = express();


app.use(express.json())
app.use(cookieParser());

/**
 * - Routes 
 * - /api/
 */

app.use('/api/auth/',authRouter)
app.use('/api/accounts/',accountsRouter);
app.use('/api/transactions/',transactionRouter);


module.exports = app;