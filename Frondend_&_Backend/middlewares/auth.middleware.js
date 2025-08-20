import { asyncHandler } from "../util/asyncHandler.util.js";
import { ApiError } from "../util/ApiError.util.js"
import jwt from "jsonwebtoken"
import { Client } from "../models/client.model.js";

export const verifyJWT = asyncHandler( async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(
                401,
                "Unauthorized request"
            )
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await Client.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
} )