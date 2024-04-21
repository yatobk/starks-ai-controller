import { invokeLambdaFunction } from "../../actions/invoke.js";
import { LambdaEvent, LambdaResponse } from "../../types/lambda.js";

type MessageResponse = {
    message: string;
};

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
        const lambdaResponse = await invokeLambdaFunction(event);
        if (typeof lambdaResponse !== 'string') {
            throw new Error(`Expected string from lambdaResponse, got: ${typeof lambdaResponse}`);
        }
        const parsedResponse: LambdaResponse = JSON.parse(lambdaResponse);
        const text = parsedResponse.text;
        return splitText(text);
    } catch (error) {
        console.error('Error invoking AI or processing response:', error);
        return [{ message: "An error occurred while processing your request." }];
    }
}
