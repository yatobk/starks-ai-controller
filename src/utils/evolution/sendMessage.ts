import { invokeLambdaFunction } from "../../actions/invoke.js";
import { LambdaEvent, LambdaResponse } from "../../types/lambda.js";

type MessageResponse = {
    message: string;
};

export const defaultErrorMessage = "Desculpe mas não entendi sua última mensagem, poderia enviar em texto por favor?"

function answerMessages(messages: string[]): MessageResponse[] {
    return messages.map(msg => ({ message: msg }));
}

// function splitText(text: string): MessageResponse[] {
//     const messages: string[] = text.split('\n\n').map((message) => message.trim()).filter((message) => message);
//     return answerMessages(messages);
// }

function splitText(text: string): MessageResponse[] {
    text = text.replace(/[\*\#]/g, '');

    // Padrão para capturar URLs, e-mails, horários e outros padrões complexos
    const complexPattern = /(\bhttps?:\/\/[^\s]+|[^\s]+@[^\s]+|\b\d+\.\s|\w+\.\w+|\b\d{1,2}:\d{2} às \d{1,2}:\d{2}\b|SEG à SEX⋅ \d{2}:\d{2} às \d{2}:\d{2}|Telefone:|\bEndereço:|\d{5}-\d{3})/g;
    const placeholders: string[] = text.match(complexPattern) || [];

    // Substitui os padrões complexos por placeholders
    const placeholder = 'PLACEHOLDER_';
    let currentIndex = 0;
    const textWithPlaceholders = text.replace(complexPattern, () => `${placeholder}${currentIndex++}`);

    // Padrão para capturar delimitadores, evitando divisões inadequadas em horários e outros
    const doublePunctuationPattern = /([.!?;:\n])(\s*[\)\]\}\>\-\—]*\s*)/g;
    const splitMarker = 'SPLIT_MARKER';

    // Substitui os delimitadores por marcadores de divisão
    const textWithSplitMarkers = textWithPlaceholders.replace(doublePunctuationPattern, '$1$2' + splitMarker);

    // Divide o texto pelos marcadores de divisão
    let parts: string[] = textWithSplitMarkers.split(splitMarker);

    // Restaura os placeholders para seus valores originais
    if (placeholders.length > 0) {
        parts = parts.map((part: string) =>
            placeholders.reduce((acc: string, val: string, idx: number) => acc.replace(`${placeholder}${idx}`, val), part)
        );
    }

    // Limpa partes vazias e retira espaços extras
    parts = parts.map(part => part.trim()).filter(part => part !== '');

    // Agrupa emojis com a mensagem anterior
    const finalParts: string[] = parts.reduce((acc: string[], part: string) => {
        if (part.match(/[\u{1F600}-\u{1F64F}]/u) && acc.length > 0) {  // Se é um emoji
            acc[acc.length - 1] += ' ' + part;
        } else {
            acc.push(part);
        }
        return acc;
    }, []);

    return answerMessages(finalParts);
}


export async function invokeAI(event: LambdaEvent): Promise<MessageResponse[]> {
    try {

        if (event.userInput === defaultErrorMessage) {
            return [{ message: defaultErrorMessage }];

        } else {
            const lambdaResponse = await invokeLambdaFunction(event);
            if (typeof lambdaResponse !== 'string') {
                throw new Error(`Expected string from lambdaResponse, got: ${typeof lambdaResponse}`);
            }
            const parsedResponse: LambdaResponse = JSON.parse(lambdaResponse);
            const text = parsedResponse.text;

            return splitText(text);
        }
    } catch (error) {
        console.error('Error invoking AI or processing response:', error);

        return [{ message: "Desculpe ocorreu um erro e não consegui entender sua mensagem, por favor aguarde um instante." }];
    }
}
