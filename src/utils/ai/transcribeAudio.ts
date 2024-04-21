import { OpenAI } from 'openai';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { createReadStream } from "fs"

function generateRandomString(length: number): string {
    const randFileName = randomBytes(length).toString('hex').slice(0, length);
    return randFileName;
}

export async function transcribeAudio(base64Audio: string): Promise<{ responseText: string, totalTokens: number }> {
    const client = new OpenAI();
    const audioData = Buffer.from(base64Audio, 'base64');
    const randomString = generateRandomString(16);
    const audioFileName = `audio_${randomString}.ogg`;
    const tmpFolder = 'tmp';
    const tmpPath = join(process.cwd(), tmpFolder);
    const audioFilePath = join(tmpPath, audioFileName);

    try {
        await writeFile(audioFilePath, audioData);
        const transcription = await client.audio.transcriptions.create({
            model: "whisper-1",
            file: createReadStream(audioFilePath),
            language: "pt",
            response_format: "json"
        });

        return { responseText: transcription.text, totalTokens: 0 };
    } catch (error) {
        console.error("Error in transcription:", error);
        throw new Error(`Failed to transcribe audio: ${error.message}`);
    } finally {
        await unlink(audioFilePath).catch(unlinkError => console.error("Error deleting the audio file:", unlinkError));
    }
}
