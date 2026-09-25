const express = require('express')

const {registerUserControler,loginController,logoutController} = require('../controllers/auth.controller')

const router= express.Router();

/**
 * - Register User Route
 * - POST /api/auth/register
 */
router.post('/register',registerUserControler)

/**
 * - Login User Route
 * - POST /api/auth/Login
 */
router.post('/login',loginController)


router.post('/logout',logoutController) 

module.exports=router