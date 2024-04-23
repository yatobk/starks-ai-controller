import { invokeLambdaFunction } from "../../actions/invoke.js";
import { LambdaEvent, LambdaResponse } from "../../types/lambda.js";

type MessageResponse = {
    message: string;
};

export const defaultErrorMessage = "Desculpe mas não entendi sua última mensagem, poderia enviar em texto por favor?"

function answerMessages(messages: string[]): MessageResponse[] {
    const responses: MessageResponse[] = messages.map((message) => ({ message }));
    return responses;
}

function splitText(text: string): MessageResponse[] {
    const messages: string[] = text.split('\n\n').map((message) => message.trim()).filter((message) => message);
    return answerMessages(messages);
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
