'use server';
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";

export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();
    const supabase = createSupabaseClient();

    const {data, error} = await supabase
        .from('companions')
        .insert({...formData, author})
        .select();

        if (error || !data) {
            throw new Error(error?.message || 'Failed to create companion');
        }

    return data[0];
}

export const getAllCompanions = async ({limit = 10, page = 1, subject, topic, author}: GetAllCompanions & { author?: string }) => {
    const supabase = createSupabaseClient();

    let query = supabase
        .from('companions')
        .select();

    if (author) {
        query = query.eq('author', author);
    }

    if (subject && topic) {
        query = query.ilike('subject', `%${subject}%`)
        .or('topic.ilike.%${topic}%,name.ilike.%${topic}%');
    } else if (subject){
        query = query.ilike('subject', `%${subject}%`);
    } else if (topic) {
        query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    }

    query = query.range((page - 1) * limit, page * limit - 1);

    const {data: companions, error} = await query;

    if (error) {
        throw new Error(error.message);
    }

    return companions;
}

export const getCompanion = async (id: string) => {
    const supabase = createSupabaseClient();

    const {data, error} = await supabase
        .from('companions') // Fetching companion by ID
        .select() // Select all fields
        .eq('id', id); // Filter by ID

    if (error || !data) {
        throw new Error(error?.message || 'Companion not found');
    }

    return data[0]; // Return the first companion found
}

// Add a companion to the session history for the current user
export const addToSessionHistory = async (companionId: string) => {
    const {userId} = await auth();
    const supabase = createSupabaseClient();

    const {data, error} = await supabase.from('session_history')
    .insert({
        companion_id: companionId,
        user_id: userId,
    })

    if (error) throw new Error(error.message || 'Failed to add to session history');
    return data;
} 

// Fetch recent sessions for a user, limited to the last 10 by default
export const getRecentSessions = async (limit = 10) => {
    const supabase = createSupabaseClient();

    const {data, error} = await supabase
        .from('session_history')
        .select('companions: companion_id (*)') // Fetch companions related to session history
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        throw new Error(error.message || 'Failed to fetch recent sessions');
    }

    return data.map(({ companions }) => companions)
}

// Fetch user sessions by user ID, limited to the last 10 by default
export const getUserSessions = async (userId: string, limit = 10) => {
    const supabase = createSupabaseClient();

    const {data, error} = await supabase
        .from('session_history')
        .select('companions: companion_id (*)') // Fetch companions related to session history
        .eq('user_id', userId) // Filter by user ID
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        throw new Error(error.message || 'Failed to fetch user sessions');
    }

    return data.map(({ companions }) => companions)
}
// Fetch all companions for a specific user
// This function retrieves all companions created by a specific user
export const getUserCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();

    const {data, error} = await supabase
        .from('companions')
        .select() // Fetch all companions
        .eq('author', userId) 

    if (error) {
        throw new Error(error.message || 'Failed to fetch user companions');
    }

    return data
}

export const newComapanionPermissions = async () => {
    const {userId, has} = await auth();
    const supabase = createSupabaseClient();

    let limit = 0;

    if (has({plan: 'premium'})) {
        return true;
    } else if (has({feature: '3_companion_limit'})) {
        limit = 3;
    } else if (has({feature: '10_companion_limit'})) {
        limit = 10;
    }
    
    const {data, error} = await supabase
        .from('companions')
        .select('id',{ count: 'exact'})
        .eq('author', userId);
    if (error) {
        throw new Error(error.message);
    }
    const companionCount = data?.length;

    if (companionCount >= limit) {
        return false;
    }  else {
        return true;
    }
}