const express = require('express')

const authMiddleware = require('../middlewares/auth.middleware')
const transactionController = require('../controllers/transaction.controller')

const router = express.Router()

/**
 * - Transaction Creation Route
 * - POST /api/transactions/
 * - Protected Route
 */
router.post('/',authMiddleware.authMiddleware,transactionController.createTransaction)

/**
 * - Deposit Transactions Route
 * - POST /api/transactions/deposit
 * - Protected Route
 */
router.post('/deposit',authMiddleware.systemAuthMiddleware,transactionController.depositTransactions)

/**
 * - Withdrawal Transactions Route
 * - POST /api/transactions/withdrawal
 * - Protected Route
 */
router.post('/withdraw',authMiddleware.systemAuthMiddleware,transactionController.withdrawalTransactions)

/**
 * - Check Balance Route
 * - GET /api/transactions/balance
 * - Protected Route
 */
router.get('/balance',authMiddleware.authMiddleware,transactionController.checkBalance)

module.exports = router