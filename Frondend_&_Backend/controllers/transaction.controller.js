import { Sender } from "../models/sender.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";

const makeTransaction = asyncHandler( async(req, res) => {
    const { transactionId, amount, currency, timestamp, paymentMethod, location, recieverId,
        userId, email, phone, transactionStatus } = req.body

    const sender = await Sender.findOne({
        userId
    })

    if (!sender) {
        sender = Sender.create({
            userId: userId,
            email,
            phone
        })
    }

    const response_ML_API = await fetch("", {
        method: "POST",
        body: JSON.stringify({
            transactionId, amount, currency, timestamp, paymentMethod, location, recieverId, transactionStatus,
            totalTransactions: sender.totalTransactions,
            averageTransactionAmount: sender.averageTransactionAmount,
            disputedTransactions: sender.disputedTransactions,
            fraudulentTransactions: sender.fraudulentTransactions
        })
    })

    if (transactionStatus === "DISPUTED") {
        sender.disputedTransactions = sender.disputedTransactions + 1
    }

    sender.averageTransactionAmount = ((sender.totalTransactions * sender.averageTransactionAmount) + amount)/(sender.totalTransactions + 1)
    sender.totalTransactions = sender.totalTransactions + 1

    const fraudPrediction = "Unlikely to be a fraud"

    if (response_ML_API.fraudScore >= 7.5) {
        fraudPrediction = "Likely to be a fraud"
    }

    res.status(200).json(
        new ApiResponse(200, fraudPrediction, response_ML_API)
    )
} )

export {
    makeTransaction
}