import { Router } from "express";
import { changeCurrentUserPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails } from "../controllers/user.controller";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(logoutUser)
router.route("/refresh-access-token").post(refreshAccessToken)
router.route("/update-account-details").post(updateAccountDetails)
router.route("/change-password").post(changeCurrentUserPassword)
router.route("/get-current-user").get(getCurrentUser)

export default router