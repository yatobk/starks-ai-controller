import { OpenAI } from 'openai';
import { GetAiById } from '../supabase/ai.js';

export async function describeImage(base64Img: string, aiId: string): Promise<{ responseText: string, totalTokens: number }> {

    const { openai_api_key } = await GetAiById({ id: aiId })
    const client = new OpenAI({ apiKey: openai_api_key });

    const urlImage = `data:image/jpeg;base64,${base64Img}` as any
    try {
        const description = await client.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "O que tem nessa imagem?" },
                        {
                            type: "image_url",
                            image_url: urlImage,
                        },
                    ]
                }
            ],
            max_tokens: 150,
            temperature: 0.2,
            frequency_penalty: 2.0,
            presence_penalty: 2.0
        });

        return {
            responseText: description.choices[0].message.content,
            totalTokens: description.usage.total_tokens
        };
    } catch (error) {
        console.error('Erro ao descrever a imagem:', error);
        throw new Error('Falha ao processar a descrição da imagem.');
    }
}
