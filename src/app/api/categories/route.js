import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET() {
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
        .from('therapeutic_categories')
        .select('*')
        .order('level', { ascending: true })
        .order('name', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
}

export async function POST(request) {
    const supabase = getSupabaseServer()
    const body = await request.json()
    const { data, error } = await supabase
        .from('therapeutic_categories')
        .insert({
            name: body.name,
            parent_id: body.parent_id || null,
            icon: body.icon || null,
            level: body.level || 1,
        })
        .select()
        .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request) {
    const supabase = getSupabaseServer()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const { error } = await supabase
        .from('therapeutic_categories')
        .delete()
        .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
