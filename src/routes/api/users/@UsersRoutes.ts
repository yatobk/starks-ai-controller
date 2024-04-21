
import { app } from "../../../index.js"
import { GetUser } from "./user.js"

export const UserRoutes = async () => {
    app.register(GetUser)
}
