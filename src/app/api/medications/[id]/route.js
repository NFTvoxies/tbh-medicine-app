import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET(request, { params }) {
    const supabase = getSupabaseServer()
    const { id } = await params

    const [medRes, batchRes] = await Promise.all([
        supabase
            .from('medications')
            .select('*, molecules(id,name), therapeutic_categories(id,name)')
            .eq('id', id)
            .maybeSingle(),
        supabase
            .from('batches')
            .select('*, donations(id,donor_name)')
            .eq('medication_id', id)
            .order('expiration_date', { ascending: true }),
    ])

    if (medRes.error)
        return NextResponse.json({ error: medRes.error.message }, { status: 500 })
    if (!medRes.data)
        return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
        medication: medRes.data,
        batches: batchRes.data || [],
    })
}

export async function PATCH(request, { params }) {
    const supabase = getSupabaseServer()
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabase
        .from('medications')
        .update(body)
        .eq('id', id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function DELETE(request, { params }) {
    const supabase = getSupabaseServer()
    const { id } = await params

    const { error } = await supabase.from('medications').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
