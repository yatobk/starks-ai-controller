import { supabase } from '../../config/supabase.js';
import { z } from 'zod';

export interface EvolutionSchema {
    id: string;
    user: string;
    instanceName: string;
    ownerJid: string;
    serverUrl: string;
    integration: string;
    apiKey: string;
    webhookWaBusiness: string;
}

const bodySchema = z.object({
    owner: z.string().min(1)
});

export async function GetEvolutionByOwner(body: { owner: string }): Promise<EvolutionSchema | null> {
    const parsedBody = bodySchema.safeParse(body);
    if (!parsedBody.success) {
        console.error("Invalid request body provided for GetEvolutionByOwner:", body);
        throw new Error("Invalid request body");
    }

    const { owner } = parsedBody.data;

    try {
        const { data, error } = await supabase
            .from("evolution")
            .select()
            .eq("ownerJid", owner)
            .single();

        if (error) {
            console.error(`Failed to fetch Evolution record for owner ${owner}`, error);
            throw new Error(`Failed to fetch Evolution record: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error(`An unexpected error occurred while fetching Evolution record for owner ${owner}`, error);
        throw new Error(`An unexpected error occurred: ${error.message}`);
    }
}
