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

    const complexPattern = /(\bhttps?:\/\/[^\s]+|[^\s]+@[^\s]+\.\w+|\[[^\]]+\]\((mailto:[^\s]+|https?:\/\/[^\s]+)\))/g;
    const placeholders: string[] = text.match(complexPattern) || [];

    const placeholder = 'PLACEHOLDER_';
    let currentIndex = 0;
    const textWithPlaceholders = text.replace(complexPattern, () => `${placeholder}${currentIndex++}`);

    const textWithNewLines = textWithPlaceholders.replace(/([!?])(\s|$)/g, (match, p1, p2) => p2 === ' ' ? `${p1}${p2}` : `${p1}\n`);

    const splitPattern = /([.!?])(\s*[\n])|(\bhttps?:\/\/[^\s]+|[^\s]+@[^\s]+\.\w+)|(\n\n)/g;
    const splitMarker = 'SPLIT_MARKER';

    const textWithSplitMarkers = textWithNewLines.replace(splitPattern, '$1$2$3$4' + splitMarker);

    let parts = textWithSplitMarkers.split(splitMarker);

    if (placeholders.length > 0) {
        parts = parts.map((part: string) =>
            placeholders.reduce((acc: string, val: string, idx: number) => {
                const hyperlinkMatch = val.match(/\[[^\]]+\]\((mailto:[^\s]+|https?:\/\/[^\s]+)\)/);
                if (hyperlinkMatch) {
                    const url = hyperlinkMatch[1];
                    if (url.startsWith('mailto:')) {
                        return acc.replace(`${placeholder}${idx}`, url.replace('mailto:', ''));
                    } else {
                        return acc.replace(`${placeholder}${idx}`, url);
                    }
                } else {
                    return acc.replace(`${placeholder}${idx}`, val);
                }
            }, part)
        );
    }

    parts = parts.map(part => part.trim()).filter(part => part !== '');
    parts = parts.filter(part => !/^-{2,}$/.test(part));

    const finalParts = parts.reduce((acc: string[], part: string) => {
        if (part.match(/[\u{1F600}-\u{1F64F}]/u) && acc.length > 0) {
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
