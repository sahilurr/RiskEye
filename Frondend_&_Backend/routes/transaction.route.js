import { Router } from "express";
import { makeTransaction } from "../controllers/transaction.controller.js";

const router = Router()

router.route("/make-transaction").post(makeTransaction)

export default router