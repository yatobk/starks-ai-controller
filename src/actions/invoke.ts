import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { LambdaEvent, LambdaResponse } from "../types/lambda.js";

export async function invokeLambdaFunction(event: LambdaEvent): Promise<LambdaResponse> {
    const client = new LambdaClient({ region: "us-east-1" });

    const command = new InvokeCommand({
        FunctionName: "starks-ai",
        Payload: new TextEncoder().encode(JSON.stringify(event)),
    });

    try {
        const response = await client.send(command);
        if (response.StatusCode === 200 && response.Payload) {
            const payloadString = new TextDecoder().decode(response.Payload);
            try {
                const payload: LambdaResponse = JSON.parse(payloadString);
                return payload;
            } catch (parseError) {
                console.error('Error parsing LambdaResponse:', parseError);
                throw new Error('Error parsing LambdaResponse.');
            }
        } else {
            throw new Error(`Function invocation failed with status: ${response.StatusCode}`);
        }
    } catch (error) {
        console.error('Error invoking Lambda function:', error);
        throw error;
    }
}
