import { app } from "../../../index.js"
import { PauseChat } from "./pause/pause.js"
import { ResumeChat } from "./resume/resume.js"

export const ChatControllerRoutes = async () => {
    app.register(PauseChat)
    app.register(ResumeChat)
}