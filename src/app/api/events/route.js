import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET() {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
}

export async function POST(request) {
    const supabase = getSupabaseServer()
    const body = await request.json()
    const { data, error } = await supabase
        .from('events')
        .insert(body)
        .select()
        .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
}
