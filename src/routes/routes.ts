import { UserRoutes } from './api/users/@UsersRoutes.js';
import { EvolutionRoutes } from './api/evo/@EvolutionRoutes.js';
import { app } from '../index.js';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AiRoutes } from './api/ai/@AiRoutes.js';

export const baseApiRoute = "/api"

const HomePage = async (app: FastifyInstance, options, done) => {
    app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            reply.send({ message: "Hello from /" });
        } catch (error) {
            reply.status(500).send({ error: error.message });
        }
    });
}

export const routes = async () => {
    app.register(HomePage)
    app.register(UserRoutes)
    app.register(EvolutionRoutes)
    app.register(AiRoutes)
}