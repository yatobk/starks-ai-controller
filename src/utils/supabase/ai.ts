import { supabase } from '../../config/supabase.js';
import { z } from 'zod';


export interface AiSchema {
    id: string;
    prompt: string;
    openai_api_key: string;
}

const queryParamsSchema = z.object({
    id: z.string().min(1)
});

export async function GetAiById(queryParams: { id: string }): Promise<AiSchema | null> {
    const parsedParams = queryParamsSchema.safeParse(queryParams);
    if (!parsedParams.success) {
        console.error("Invalid query parameters provided:", queryParams);
        throw new Error("Invalid query parameters");
    }

    const { id } = parsedParams.data;

    try {
        const { data, error } = await supabase
            .from("ai")
            .select()
            .eq("id", id)
            .single();

        if (error) {
            console.error("Failed to fetch AI record for ID", id, error);
            throw new Error(`Failed to fetch AI record: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error("An unexpected error occurred while fetching AI record for ID", id, error);
        throw new Error(`An unexpected error occurred: ${error.message}`);
    }
}
