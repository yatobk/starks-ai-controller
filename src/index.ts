import Fastify from 'fastify';
import { routes } from './routes/routes.js';

export const app = Fastify({ logger: true });

app.register(routes);

// try {
//     const host = "0.0.0.0"
//     const port = 6000
//     await app.listen({ host: host, port: port });
//     app.log.info(`Server running at http://${host}:${port}`);

// } catch (err) {
//     app.log.error(err);
//     process.exit(1);
// }

const { ADDRESS = 'localhost', PORT = '6000' } = process.env;

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
