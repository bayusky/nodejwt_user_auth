require('dotenv').config({path: ".env"})
const express = require ('express')
const app = express()
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')

//connect to DB first
connectDB()

app.use(express.json())

app.use('/api/auth', require('./routers/auth'))
app.use('/api/private', require('./routers/private'))

//error handler : last middleware

app.use(errorHandler)

const PORT = process.env.PORT

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

process.on("unhandledRejection", (err, promise) =>{
    console.log(`Logged Error: ${err}`)
    server.close(() => process.exit(1))
})
