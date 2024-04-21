import { OpenAI } from 'openai';

export async function describeImage(base64Img: string): Promise<{ responseText: string, totalTokens: number }> {
    const client = new OpenAI();

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
                            image_url: `data:image/png;base64,${base64Img}` as any,
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
