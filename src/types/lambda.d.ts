export interface LambdaEvent {
    userInput: string,
    memoryKey: string,
    ai: string;
    stream?: boolean;
}

export interface LambdaResponse {
    status: number;
    timestamp: string;
    text: string;
    message?: string;
}