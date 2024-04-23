import Fastify from 'fastify';
import { routes } from './routes/routes.js';

export const app = Fastify({ logger: true });

app.register(routes);

const { ADDRESS = 'localhost', PORT = '7000' } = process.env;

try {
    app.listen({ host: ADDRESS, port: parseInt(PORT, 10) }, (err, address) => {
        if (err) {
            console.error(err)
            process.exit(1)
        }
        console.log(`Server listening at ${address}`)
    })
} catch (err) {
    app.log.error(err);
    process.exit(1);
}
