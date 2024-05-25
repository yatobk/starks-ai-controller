import { transcribeAudio } from '../ai/transcribeAudio.js';
import { describeImage } from '../ai/describeImage.js';
import Evolution from './evolution.js';
import { WebhookSchema, ResponseData, SenderData, WebhookImageSchema } from '../../types/evolution.js'
import { z } from 'zod'
import { GetEvolutionByOwner } from '../supabase/evolution.js';
import { GetUserById } from '../supabase/users.js';
import { defaultErrorMessage } from './sendMessage.js';

export function processWebhook(event: z.infer<typeof WebhookSchema>): any {

    const eventType = event.event;

    if (eventType === "messages.upsert") {
        const messageType = event.data.messageType;
        switch (messageType) {
            case "extendedTextMessage":
                return getExtendedMessage(event);
            case "ephemeralMessage":
                return getExtendedMessage(event);
            case "conversation":
                return getConversationMessage(event);
            case "audioMessage":
                return getAudioMessage(event);
            case "imageMessage":
                return getImageMessage(event);
            case "videoMessage":
                return getVideoMessage(event);
            default:
                return sendErrorMessage(event);
        }
    }
}

function getSenderData(event: any): SenderData {
    return {
        owner: event.sender,
        instance: event.instance,
        apiKey: event.apikey
    };
}

function sendErrorMessage(event: any): Promise<ResponseData> {
    const remoteJid = event.data.key.remoteJid;
    const messageType = event.data.messageType;
    const sender = getSenderData(event)
    const text = defaultErrorMessage;
    return responseHandler(remoteJid, text, messageType, sender);
}

async function responseHandler(remoteJid: string, text: string, messageType: string, sender: SenderData): Promise<ResponseData> {

    const { owner } = sender

    const ai = text !== defaultErrorMessage ?
        (await GetUserById({ id: (await GetEvolutionByOwner({ owner })).user })).ai : "9e927d3c-a81b-4177-8915-ce3c654dcd1f";

    const data: ResponseData = {
        messageType,
        input: text,
        remoteJid,
        sender,
        memoryKey: `${sender.owner}@${remoteJid}`,
        ai: ai
    };

    return data;
}

function getConversationMessage(event: z.infer<typeof WebhookSchema>): Promise<ResponseData> {

    const remoteJid = event.data.key.remoteJid;
    const text = event.data.message.conversation || "";
    const messageType = event.data.messageType;
    const sender = getSenderData(event)
    return responseHandler(remoteJid, text, messageType, sender);
}

function getExtendedMessage(event: z.infer<typeof WebhookSchema>): Promise<ResponseData> {

    const remoteJid = event.data.key.remoteJid;
    const text = event.data.message.extendedTextMessage?.text || "";
    const messageType = event.data.messageType;
    const sender = getSenderData(event)
    return responseHandler(remoteJid, text, messageType, sender);
}

async function getAudioMessage(event: any): Promise<ResponseData> {
    const remoteJid = event.data.key.remoteJid;
    const messageType = event.data.messageType;
    const sender = getSenderData(event);
    const audioId = event.data.key.id;
    const instance = event.data.owner;
    const apiKey = event.apikey;
    const evolution = new Evolution(instance, apiKey);

    try {
        //const audioBase64 = await evolution.convertAudioToBase64(audioId);
        const audioBase64 = event.data.message.base64
        const owner = sender.owner
        const { ai } = await GetUserById({ id: (await GetEvolutionByOwner({ owner })).user });

        const text = (await transcribeAudio(audioBase64, ai)).responseText;
        return responseHandler(remoteJid, text, messageType, sender);
    } catch (error) {
        console.error("Failed to process audio message:", error);
        return sendErrorMessage(event);
    }
}

async function getImageMessage(event: z.infer<typeof WebhookImageSchema>): Promise<ResponseData> {
    const remoteJid = event.data.key.remoteJid;
    const imageBase64 = event.data.message.base64!;
    const messageType = event.data.messageType;
    const sender = getSenderData(event);

    try {
        const owner = sender.owner
        const { ai } = await GetUserById({ id: (await GetEvolutionByOwner({ owner })).user });

        const text = (await describeImage(imageBase64, ai)).responseText;
        const captions = event.data.message.imageMessage.caption || "";
        const combinedText = `O usuário enviou uma imagem com a seguinte legenda:\n'${captions}'\n\n'E a descrição da imagem é:\n'${text}'`;
        return responseHandler(remoteJid, combinedText, messageType, sender);
    } catch (error) {
        console.error("Failed to process image message:", error);
        return sendErrorMessage(event);
    }
}

function getVideoMessage(event: any) {
    return sendErrorMessage(event)
}