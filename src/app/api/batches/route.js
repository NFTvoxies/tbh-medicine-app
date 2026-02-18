import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET(request) {
    const supabase = getSupabaseServer()
    const { searchParams } = new URL(request.url)
    const medicationId = searchParams.get('medication_id')

    let query = supabase
        .from('batches')
        .select(`
      *,
      medications ( id, brand_name, generic_name, form, dosage ),
      donations ( id, donor_name ),
      locations ( id, name )
    `)
        .order('expiration_date', { ascending: true })

    if (medicationId) {
        query = query.eq('medication_id', medicationId)
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
}

export async function POST(request) {
    const supabase = getSupabaseServer()
    const body = await request.json()

    // Support creating multiple batches at once
    const batches = Array.isArray(body) ? body : [body]

    const { data, error } = await supabase
        .from('batches')
        .insert(batches)
        .select()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
