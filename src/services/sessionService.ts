import { supabase } from '../config/supabase.js';

interface Session {
    id: string;
    status: 'active' | 'paused' | 'expired';
    start_time: string;
}

export async function getSession(user_id: string): Promise<Session | null> {
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', user_id)
        .single();

    if (error) {
        console.error('Error fetching session:', error.message);
        return null;
    }

    return data;
}

export async function createSession(user_id: string): Promise<Session | null> {
    const { data, error } = await supabase
        .from('sessions')
        .insert({ id: user_id, status: 'active' })
        .select()
        .single()

    if (error) {
        console.error('Error creating session:', error.message);
        return null;
    }

    return data;
}


export async function updateSession(user_id: string, status: 'active' | 'paused' | 'expired'): Promise<Session | null> {
    const { data, error } = await supabase
        .from('sessions')
        .update({ status })
        .eq('id', user_id)
        .select()
        .single();

    if (error) {
        console.error('Error updating session:', error.message);
        return null;
    }

    return data;
}