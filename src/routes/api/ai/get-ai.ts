import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { GetAiById } from "../../../utils/supabase/ai.js";
import { baseApiRoute } from "../../routes.js";
import { Middleware } from "../../../config/middleware.js";

export const GetAi = async (app: FastifyInstance) => {
    app.get(`${baseApiRoute}/ai`, { preHandler: [Middleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.query as { id?: string };

        if (!id) {
            reply.status(400).send({ error: 'Ai ID is required as a query parameter' });
            return;
        }

        try {
            const ai = await GetAiById({ id });
            if (!ai) {
                reply.status(404).send({ message: "Ai not found" });
            } else {
                reply.send({ ai });
            }
        } catch (error) {
            reply.status(500).send({ error: error.message });
        }
    });
}