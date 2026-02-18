import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET() {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
        .from('molecules')
        .select('*')
        .order('name')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
}

export async function POST(request) {
    const supabase = getSupabaseServer()
    const body = await request.json()
    const { data, error } = await supabase
        .from('molecules')
        .insert({ name: body.name })
        .select()
        .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request) {
    const supabase = getSupabaseServer()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const { error } = await supabase.from('molecules').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
