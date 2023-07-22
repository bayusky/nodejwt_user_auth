const User = require('../models/User')
const errorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')

exports.register = async(req, res, next) => {
    const { username, email, password} = req.body
    try {
        const user = await User.create({
            username, email, password
        })

        sendToken(user, 201, res)
    } catch (error) {
        next(error)
    }
}

exports.login = async (req, res, next) => {
    const { email, password} = req.body

    if(!email || !password) {
        return next(new errorResponse("Please provide email and password", 400))
    }

    try {
        const user = await User.findOne({ email}).select("+password")

        if(!user){
            return next(new errorResponse("Invalid credential", 401))
        }

        const isMatch = await user.matchPassword(password)

        if(!isMatch){
            return next(new errorResponse("Invalid credential", 401))
        }

        sendToken(user, 201, res)

    } catch (error) {
        next(error)
    }
}

exports.forgotPassword = async (req, res, next) => {
    const {email} = req.body

    try {
        const user = await User.findOne({email})

        if(!user) {
            return next(new errorResponse("Invalid email", 404))
        }
        //console.log(user)

        const resetToken = user.getResetPasswordToken()

        //console.log(resetToken)

        await user.save()

        const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`

        const message = `
            <h1>You have requested a password reset</h1>
            <p>Please go to this link to reset your password</p>
            <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
            <p>Ignore this email if you not requested a password reset</p>
            `
        //console.log(user.email)
        //console.log(message)
        try {
            await sendEmail({
                to: user.email,
                subject: "Password reset request",
                text: message
            })
            console.log(user.email)

            res.status(200).json({success: true, data: "Email sent"})
        } catch (error) {
            user.resetPasswordToken = undefined
            user.resetPasswordExpired = undefined

            await user.save()

            return next(error)

        }
    } catch (error) {
        next(error)
    }
}

exports.resetPassword = async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex")

    
    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpired: { $gt: Date.now()}
        })
        

        if (!user) {
            return next(new errorResponse("Invalid token", 400))
        }

        user.password = req.body.password
        user.resetPasswordToken =undefined;
        user.resetPasswordExpired =undefined;

        await user.save()

        res.status(201).json({
            success: true,
            data: "password reset success!"
        })
    } catch (error) {
        next(error)
        
    }
}

const sendToken = (user, statusCode, res) => {
    const token = user.getSignedToken()
    res.status(statusCode).json({ success: true, token})
}