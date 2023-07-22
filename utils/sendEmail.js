const nodemailer = require('nodemailer')

const sendEmail = (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_RELAY,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_KEY
        }
    })
    //console.log(proccess.env.SMTP_RELAY)
    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: options.to,
        subject: options.subject,
        html: options.text
    }

    transporter.sendMail(mailOptions, function(err, info) {
        if(err) {
            console.log(err)
        } else {
            console.log(info)
        }
    })
}

module.exports = sendEmail