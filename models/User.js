require('dotenv').config({path: "../.env"})
const crypto = require('crypto')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Create your username"]
    },
    email: {
        type: String,
        required: [true, "Input your email"],
        match: [
            /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
            "Please provide a valid email"
        ]
    },
    password: {
        type: String,
        required: [true, "Add a password"],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpired: String,

})

//if password variable changed, then create hash (password+salt)
UserSchema.pre("save", async function(next) {
    if(!this.isModified("password")) {
        next();
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

UserSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.getSignedToken = function () {
    return jwt.sign({ id: this._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE})
}

UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex")

    this.resetPasswordToken = crypto.createHash("sha256")
    .update(resetToken)
    .digest("hex")
    
    this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);
    return resetToken
}

const User = mongoose.model("user", UserSchema)
module.exports = User