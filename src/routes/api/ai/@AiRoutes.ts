
import { app } from "../../../index.js"
import { GetAi } from "./get-ai.js"

export const AiRoutes = async () => {
    app.register(GetAi)
}

