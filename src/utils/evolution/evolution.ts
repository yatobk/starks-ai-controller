import axios from 'axios';
import { randomInt } from 'crypto';
import { userMessages } from './userData.js';
import { TextMessagePayload } from '../../types/evolution.js';
import { env } from '../../config/zod-env.js';
import { invokeAI } from './sendMessage.js';

class Evolution {
    private baseUrl: string;
    private instance: string;
    private apiKey: string;

    constructor(instance: string, apiKey: string) {
        this.baseUrl = env.EVOLUTION_BASE_URL;
        this.instance = instance;
        this.apiKey = apiKey;
    }

    async sendText(remoteJid: string, text: string): Promise<any> {
        try {
            const headers = {
                apiKey: this.apiKey
            };

            const payload: TextMessagePayload = {
                number: remoteJid,
                options: {
                    delay: randomInt(1200, 2000),
                    presence: "composing",
                    linkPreview: true
                },
                textMessage: {
                    text: text
                }
            };

            const response = await axios.post(`${this.baseUrl}/message/sendText/${this.instance}`, payload, { headers });

            return response.data;

        } catch (error) {
            console.error("Failed to send text message:", error);
            throw new Error(`Failed to send text message to ${remoteJid}: ${error.message}`);
        }
    }

    async sendTextHandler(memoryKey: string, remoteJid: string, ai: string) {
        try {
            if (userMessages.hasOwnProperty(memoryKey)) {
                const messages = userMessages[memoryKey].join('\n\n');
                const message = await invokeAI({ userInput: messages, memoryKey, ai });

                delete userMessages[memoryKey];
                for (const m of message) {
                    try {
                        await this.sendText(remoteJid, m.message);
                    } catch (sendError) {
                        if (axios.isAxiosError(sendError) && sendError.response && sendError.response.status === 400) {
                            console.error(`Request to ${remoteJid} failed with status 400:`, sendError.response.data);

                        } else {
                            console.error(`Failed to send message to ${remoteJid}:`, sendError);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error handling text send:", error);
            throw new Error(`Error processing messages for ${memoryKey}: ${error.message}`);
        }
    }

    async convertAudioToBase64(audioId: string): Promise<string> {
        try {
            const headers = {
                apiKey: this.apiKey
            };

            const payload = {
                message: {
                    key: {
                        id: audioId
                    }
                },
                convertToMp4: false
            };

            const response = await axios.post(`${this.baseUrl}/chat/getBase64FromMediaMessage/${this.instance}`, payload, { headers });
            return response.data.base64;
        } catch (error) {
            console.error("Failed to convert audio to base64:", error);
            throw new Error(`Failed to convert audio ${audioId} to base64: ${error.message}`);
        }
    }
}

export default Evolution;
