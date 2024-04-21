
import { app } from "../../../index.js"
import { DebounceMessage } from "./evolution.js"

export const EvolutionRoutes = async () => {
    app.register(DebounceMessage)
}