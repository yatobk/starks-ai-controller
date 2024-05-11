import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { baseApiRoute } from '../../routes.js';
import { GetUserById } from '../../../utils/supabase/users.js';
import { Middleware } from '../../../config/middleware.js';

export const GetUser = async (app: FastifyInstance, options, done) => {
    app.get(`${baseApiRoute}/user`, { preHandler: [Middleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.query as { id?: string };

        if (!id) {
            reply.status(400).send({ error: 'User ID is required as a query parameter' });
            return;
        }

        try {
            const user = await GetUserById({ id });
            if (!user) {
                reply.status(404).send({ message: "User not found" });
            } else {
                reply.send({ user });
            }
        } catch (error) {
            reply.status(500).send({ error: error.message });
        }
    });
}