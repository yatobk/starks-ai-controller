import { FastifyReply, FastifyRequest } from 'fastify';
import { env } from './zod-env.js';

export const Middleware = (request: FastifyRequest, reply: FastifyReply, done) => {

    console.log("middlware acionado")
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        return reply.status(401).send({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return reply.status(401).send({ error: 'Bearer token is missing' });
    }

    const expectedToken = env.SECRET_API_TOKEN;
    if (token !== expectedToken) {
        return reply.status(403).send({ error: 'Invalid token' });
    }

    done();
};
