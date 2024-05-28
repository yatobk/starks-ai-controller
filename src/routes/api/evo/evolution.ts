import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { debounce } from '../../../actions/debounce.js';
import { processWebhook } from '../../../utils/evolution/processEvent.js';
import { ResponseData } from '../../../types/evolution.js';
import Evolution from '../../../utils/evolution/evolution.js';
import { userMessages } from '../../../utils/evolution/userData.js';
import { baseApiRoute } from '../../routes.js';
import { createSession, getSession, updateSession } from '../../../services/sessionService.js';

export const DebounceMessage = async (app: FastifyInstance, options, done) => {
    const debouncedHandlers = {};

    app.post(`${baseApiRoute}/evo`, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const payload = request.body;

            if (!payload) {
                return reply.status(400).send("No payload provided");
            }

            const finalData: ResponseData = await processWebhook(payload);

            let session = await getSession(`${finalData.sender.instance}@${finalData.remoteJid}`);

            if (!session) {
                session = await createSession(`${finalData.sender.instance}@${finalData.remoteJid}`);
                if (!session) {
                    return reply.status(500).send({ status: 'Error creating session' });
                }
            } else if (session.status === 'paused') {
                return reply.send({ status: 'Session paused' });
            } else if (session.status === 'expired') {
                session = await updateSession(`${finalData.sender.instance}@${finalData.remoteJid}`, "active");
                if (!session) {
                    return reply.status(500).send({ status: 'Error creating session' });
                }
            }

            if (session.status === 'active') {

                if (finalData.memoryKey in userMessages) {
                    userMessages[finalData.memoryKey].push(finalData.input);
                } else {
                    userMessages[finalData.memoryKey] = [finalData.input];
                }

                const wpp = new Evolution(finalData.sender.instance, finalData.sender.apiKey);

                if (!(finalData.memoryKey in debouncedHandlers)) {
                    debouncedHandlers[finalData.memoryKey] = debounce(async () => {
                        await wpp.sendTextHandler(finalData.memoryKey, finalData.remoteJid, finalData.ai);
                        delete userMessages[finalData.memoryKey];
                    }, 5000);
                }

                debouncedHandlers[finalData.memoryKey]();

                const sendMessageResponse = {
                    status: 200,
                    message: "success"
                };

                return reply.send(sendMessageResponse);
            } else {
                return reply.status(400).send({ status: 'Session not active' });
            }

        } catch (error) {
            if (error.message !== "Debounced") {
                reply.status(500).send(`Error: ${error.message}`);
            }
        }
    });

    done();
}
