/* eslint-disable @typescript-eslint/no-explicit-any */
import { SupabaseClient } from '@supabase/supabase-js'

export async function createLog(
    supabase: SupabaseClient, 
    { 
        itemId, 
        userId, 
        action, 
        details = null 
    }: { itemId: string, userId: string, action: string, details?: any }
) {
    // Não paramos o fluxo se o log falhar (fire and forget), apenas logamos no console
    try {
        await supabase.from('qa_logs').insert({
            qa_item_id: itemId,
            user_id: userId,
            action,
            details
        })
    } catch (err) {
        console.error('Erro ao criar log:', err)
    }
}

export async function getItemLogs(supabase: SupabaseClient, itemId: string) {
    const { data, error } = await supabase
        .from('qa_logs')
        .select(`
            *,
            user:users(id, name)
        `)
        .eq('qa_item_id', itemId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}