import mongoose, { Schema } from "mongoose"

const transactionSchema = new mongoose.Schema(
    {
        transactionId: {
            type: String,
            required: true,
            index: true
        },
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            required: true
        },
        timestamp: {
            type: String,
            required: true
        },
        paymentMethod: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        clientId: {
            type: Schema.Types.ObjectId,
            ref: "Client",
            required: true
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "Sender",
            required: true
        },
        recieverId: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "flagged"],
            required: true
        },
        fraudScore: {
            type: Number
        }
    }
)

export const Transaction = mongoose.model("Transaction", transactionSchema)