const express= require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const accountsController = require('../controllers/accounts.controller');

const router = express.Router();


/**
 * - Account Creation Route
 * - POST /api/accounts/
 * - Protected Route
 */
router.post('/',authMiddleware.authMiddleware,accountsController.createAccount)

router.get('/all',authMiddleware.authMiddleware,accountsController.getAllAccounts)

module.exports =router