export interface LambdaEvent {
    userInput: string,
    memoryKey: string,
    ai: string;
    stream?: boolean;
}

export interface LambdaResponse {
    status: string;
    timestamp: string;
    text: string;
}