
import { createClient } from '@supabase/supabase-js'
import { env } from './zod-env.js'

const supabaseUrl = env.SUPABASE_PROJECT_URL
const supabaseKey = env.SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)