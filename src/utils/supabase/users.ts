import { supabase } from '../../config/supabase.js';
import { z } from 'zod';

interface Users {
    id: string;
    name: string;
    phone: string;
    created_at: string;
    ai: string | null;
    channel: string | null;
}

const queryParamsSchema = z.object({
    id: z.string().min(1)
});

export async function GetUserById(queryParams: { id?: string }): Promise<Users | null> {
    if (!queryParams.id) {
        console.error("No ID provided for GetUserById");
        throw new Error("User ID is required");
    }

    const parsedParams = queryParamsSchema.safeParse(queryParams);
    if (!parsedParams.success) {
        console.error("Invalid query parameters provided for GetUserById:", queryParams);
        throw new Error("Invalid query parameters");
    }

    const { id } = parsedParams.data;

    try {
        const { data, error } = await supabase
            .from("users")
            .select()
            .eq("id", id)
            .single();

        if (error) {
            console.error(`Failed to fetch user with ID ${id}`, error);
            throw new Error(`Failed to fetch user: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error(`An unexpected error occurred while fetching user with ID ${id}`, error);
        throw new Error(`An unexpected error occurred: ${error.message}`);
    }
}
