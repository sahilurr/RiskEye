import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: "30kb"}))
app.use(express.urlencoded({
    extended: true,
    limit: "30kb"
}))
app.use(express.static("public"))
app.use(cookieParser())

import transactionRouter from "./routes/transaction.route.js"
app.use("/api/v1/transaction", transactionRouter)

import userRouter from "./routes/user.route.js"
app.use("/api/v1/user", userRouter)

app.use((err, req, res, next) => {
    // Set default values for error response
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Send JSON error response
    res.status(statusCode).json({
        success: false,
        statusCode: statusCode,
        message: message,
        errors: err.errors || [],  // Any specific error details, such as validation errors
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // Stack trace for debugging
    });
});

export {app}