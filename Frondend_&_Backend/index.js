import connectDB from "./database/mongo_connection.js"
import {app} from "./app.js";
import dotenv from "dotenv";

dotenv.config('./env')

connectDB().then(() => {
    const port = process.env.PORT || 8000
    app.listen(port, () => {
        console.log("Connection Established at port: ", port)
    })
}).catch((error) => {
    console.log("Connection to mongoDB failed", error)
})