import { z } from 'zod';

// START OF TYPE CONVERSATION MESSAGE

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

// END OF TYPE CONVERSATION MESSAGE


// START OF TYPE IMAGE MESSAGE

const KeySchema = z.object({
    remoteJid: z.string(),
    fromMe: z.boolean(),
    id: z.string()
});

const ImageMessageSchema = z.object({
    url: z.string().url(),
    mimetype: z.string(),
    caption: z.string(),
    fileSha256: z.string(),
    fileLength: z.string(),
    height: z.number(),
    width: z.number(),
    mediaKey: z.string(),
    fileEncSha256: z.string(),
    directPath: z.string(),
    mediaKeyTimestamp: z.string(),
    jpegThumbnail: z.string(),
    firstScanSidecar: z.string(),
    firstScanLength: z.number(),
    scansSidecar: z.string(),
    scanLengths: z.array(z.number()),
    midQualityFileSha256: z.string()
}).optional();

const DeviceListMetadataSchema = z.object({
    senderKeyHash: z.string(),
    senderTimestamp: z.string(),
    recipientKeyHash: z.string(),
    recipientTimestamp: z.string()
}).optional();

const MessageContextInfoSchema = z.object({
    deviceListMetadata: DeviceListMetadataSchema,
    deviceListMetadataVersion: z.number()
}).optional();

const MessageSchema = z.object({
    imageMessage: ImageMessageSchema,
    messageContextInfo: MessageContextInfoSchema,
    base64: z.string().optional()
});

export const WebhookImageSchema = z.object({
    event: z.string({
        required_error: "Event is required",
        invalid_type_error: "Event must be a string"
    }),
    instance: z.string(),
    data: z.object({
        key: KeySchema,
        pushName: z.string().optional(),
        message: MessageSchema,
        contextInfo: z.null().optional(),
        messageType: z.string(),
        messageTimestamp: z.number(),
        owner: z.string(),
        source: z.string()
    }),
    destination: z.string().url(),
    date_time: z.string(),
    sender: z.string(),
    server_url: z.string().url(),
    apikey: z.string()
}).refine(data => data.event !== 'unwantedEvent', {
    message: "The 'event' field cannot be 'unwantedEvent'.",
    path: ["event"]
});

// END OF TYPE IMAGE MESSAGE



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
