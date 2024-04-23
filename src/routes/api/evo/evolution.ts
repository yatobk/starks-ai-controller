import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { debounce } from '../../../actions/debounce.js';
import { processWebhook } from '../../../utils/evolution/processEvent.js';
import { ResponseData } from '../../../types/evolution.js';
import Evolution from '../../../utils/evolution/evolution.js';
import { userMessages } from '../../../utils/evolution/userData.js';
import { baseApiRoute } from '../../routes.js';

export const DebounceMessage = async (app: FastifyInstance, options, done) => {
    let debouncedSendTextHandler;

    app.post(`${baseApiRoute}/evo`, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const payload = request.body;
            if (!payload) {
                return reply.status(400).send("No payload provided");
            }
            const finalData: ResponseData = await processWebhook(payload);

            if (finalData.memoryKey in userMessages) {
                userMessages[finalData.memoryKey].push(finalData.input);
            } else {
                userMessages[finalData.memoryKey] = [finalData.input];
            }

            const wpp = new Evolution(finalData.sender.instance, finalData.sender.apiKey);

            if (!debouncedSendTextHandler) {
                const { memoryKey, remoteJid, ai } = finalData

                debouncedSendTextHandler = debounce(() => wpp.sendTextHandler(memoryKey, remoteJid, ai), 5000);
            }

            debouncedSendTextHandler()

            const sendMessageResponse = {
                status: 200,
                message: "success"
            };

            reply.send(sendMessageResponse);

        } catch (error) {
            if (error.message !== "Debounced") {
                reply.status(500).send(`Error: ${error.message}`);
            }
        }
    });
}