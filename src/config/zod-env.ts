import { z } from "zod";
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    AWS_REGION: z.string().min(1),
    EVOLUTION_BASE_URL: z.string().min(1),
    SUPABASE_PROJECT_URL: z.string().min(1),
    SUPABASE_KEY: z.string().min(1),
    SECRET_API_TOKEN: z.string().min(1)
});

export const env = envSchema.parse(process.env);