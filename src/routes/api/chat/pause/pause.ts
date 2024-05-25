import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { baseApiRoute } from '../../../routes.js';
import { Middleware } from '../../../../config/middleware.js';
import { createSession, getSession, updateSession } from '../../../../services/sessionService.js';

export const PauseChat = async (app: FastifyInstance, options, done) => {
    app.get(`${baseApiRoute}/chat/pause`, { preHandler: [Middleware] }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.query as { id?: string };

        if (!id) {
            reply.status(400).send({ error: 'User ID is required as a query parameter' });
            return;
        }

        try {
            let session = await getSession(id);

            if (!session) {
                session = await createSession(id);
                if (!session) {
                    reply.status(500).send({ error: 'Error creating session' });
                    return;
                }
            }

            const chat = await updateSession(id, 'paused');
            if (!chat) {
                reply.status(404).send({ message: 'Chat not found' });
            } else {
                reply.send({ chat });
            }
        } catch (error) {
            reply.status(500).send({ error: error.message });
        }
    });

    done();
};
