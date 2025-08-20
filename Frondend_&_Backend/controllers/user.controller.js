import {User} from "../models/client.model.js";
import {ApiError} from "../utils/ApiError.util.js";
import {asyncHandler} from "../utils/asyncHandler.util.js";
import {ApiResponse} from "../utils/ApiResponse.util.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.accessToken = accessToken

        user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (e) {
        throw new ApiError(500, "Something went wrong while generating token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    const { username, fullname, email, password } = req.body
    if(
        [fullname, username, email, password].some( (field) =>
            field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "Invalid username / password / email / fullname")
    }

    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    })
    if (existingUser) {
        throw new ApiError(401, "User already exists")
    }

    const user = await User.create({
        username,
        fullname,
        password,
        email
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong and user not registered")
    }

    return res.status(200).json(
        new ApiResponse(200,
            "User successfully registered",
            createdUser)
    )
} )

const loginUser = asyncHandler( async (req, res) => {
    const { usernameOrEmail, password } = req.body

    if( !(usernameOrEmail) ) {
        throw new ApiError(401, "Username or email required for login")
    }

    const user = await User.findOne({
        $or: [{username: usernameOrEmail}, {email: usernameOrEmail}]
    })
    if (!user) {
        throw new ApiError(401, "User with this username or email does not exist")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid Password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            "User logged in successfully",
            {
                user: loggedInUser, accessToken, refreshToken
            }
        )
    )
} )

const logoutUser = asyncHandler( async (req, res) => {
    const user = await User.findById(req.user._id)
    if( !user ) {
        throw new ApiError(400, "Invalid user")
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )


    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json( new ApiResponse(200, "User logged out successfully", {}) )
} )

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
        )

        // you will get _id via decoded token (look at generateRefreshToken() in user.model.js)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const {newAccessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

        return res
          .status(200)
          .cookie("accessToken", newAccessToken)
          .cookie("refreshToken", newRefreshToken)
          .json(
            new ApiResponse(
              200,
              {
                  newAccessToken,
                  newRefreshToken
              }
            )
          )
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid refresh token")
    }

} )

const updateAccountDetails = asyncHandler( async (req, res) => {
    const {fullname, email} = req.body

    if (!email || !fullname) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname,
                // same as fullName: fullName
                email: email
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(
            new ApiResponse(200, "Account details updated successfully", user)
        )
})

const getCurrentUser = asyncHandler( async(req, res) => {
    return res.status(200)
        .json( new ApiResponse(200, "User fetched successfully", req.user) )
} )

const changeCurrentUserPassword = asyncHandler(  async (req, res) => {
    const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user._id)

    if( !(oldPassword && newPassword) ) {
        throw new ApiError(400, "Please provide both old and new password")
    }
    if( !user ) {
        throw new ApiError(400, "Invalid user")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect old password entered")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200)
        .json(new ApiResponse(200, "Password changed successfully", {}))
} )

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateAccountDetails,
    getCurrentUser,
    changeCurrentUserPassword
}