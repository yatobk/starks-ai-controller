export interface TextMessageOptions {
    delay: number;
    presence: string;
    linkPreview: boolean;
}

export interface TextMessagePayload {
    number: string;
    options: TextMessageOptions;
    textMessage: {
        text: string;
    };
}

import { z } from 'zod';
import { AiSchema } from '../utils/supabase/ai.js';

export const WebhookSchema = z.object({
    event: z.string({
        required_error: "Event is required",
        invalid_type_error: "Event must be a string"
    }),
    instance: z.string(),
    data: z.object({
        key: z.object({
            remoteJid: z.string(),
            fromMe: z.boolean(),
            id: z.string(),
        }),
        pushName: z.string().optional(),
        message: z.object({
            conversation: z.string().optional(),
            extendedTextMessage: z.object({
                text: z.string()
            }).optional(),
            base64: z.string().optional(),
            ImageMessage: z.object({
                caption: z.string()
            }).optional(),
        }),
        messageType: z.string(),
        messageContextInfo: z.object({
            deviceListMetadata: z.object({
                senderKeyHash: z.string(),
                senderTimestamp: z.string(),
                recipientKeyHash: z.string(),
                recipientTimestamp: z.string(),
            }).optional(),
            deviceListMetadataVersion: z.number(),
        }).optional(),
        messageTimestamp: z.number(),
        owner: z.string(),
        source: z.string(),
    }),
    destination: z.string(),
    dateTime: z.string(),
    sender: z.string(),
    serverUrl: z.string(),
    apikey: z.string(),
}).refine(data => data.event !== 'unwantedEvent', {
    message: "The 'event' field cannot be 'unwantedEvent'.",
    path: ["body", "event"],
});

export interface SenderData {
    owner: string;
    instance: string;
    apiKey: string;
}

export interface ResponseData {
    messageType: string;
    input: string;
    remoteJid: string;
    memoryKey: string;
    sender: SenderData;
    ai: string;
}
