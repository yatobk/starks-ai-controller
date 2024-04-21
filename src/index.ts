import Fastify from 'fastify';
import { routes } from './routes/routes.js';

export const app = Fastify({ logger: true });

app.register(routes);

try {
    const address = app.server.address();
    const port = typeof address === 'string' ? address : address?.port || 3000;
    await app.listen({ port: 6000 });
    app.log.info(`Server running at http://localhost:${port}`);

} catch (err) {
    app.log.error(err);
    process.exit(1);
}
