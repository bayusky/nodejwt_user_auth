const express = require('express')
const router = express()
const { 
    register, login, forgotPassword, resetPassword 
} = require('../controllers/auth')


router.route("/register").post(register)

router.route("/login").post(login)

router.route("/forgotpassword").post(forgotPassword)

router.route("/resetpassword/:resettoken").put(resetPassword)

module.exports = router