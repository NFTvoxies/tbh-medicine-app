import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET(request, { params }) {
    const supabase = getSupabaseServer()
    const { id } = await params

    // Fetch event + all dispenses for this event in parallel
    const [eventRes, dispensesRes] = await Promise.all([
        supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .maybeSingle(),
        supabase
            .from('dispenses')
            .select(`
                id,
                dispense_date,
                quantity_units,
                dispensed_by,
                patient_info,
                notes,
                medications ( id, brand_name, generic_name, dosage, form ),
                batches ( id, expiration_date )
            `)
            .eq('event_id', id)
            .order('dispense_date', { ascending: true }),
    ])

    if (eventRes.error)
        return NextResponse.json({ error: eventRes.error.message }, { status: 500 })
    if (!eventRes.data)
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const dispenses = dispensesRes.data || []

    // Compute summary totals
    const totalBoxes = dispenses.reduce((sum, d) => sum + (d.quantity_units || 0), 0)
    const uniqueMeds = new Set(dispenses.map((d) => d.medications?.id).filter(Boolean)).size
    const uniqueStaff = new Set(dispenses.map((d) => d.dispensed_by).filter(Boolean)).size

    return NextResponse.json({
        event: eventRes.data,
        dispenses,
        summary: {
            total_boxes: totalBoxes,
            unique_medications: uniqueMeds,
            unique_staff: uniqueStaff,
            total_dispense_records: dispenses.length,
        },
    })
}

export async function PATCH(request, { params }) {
    const supabase = getSupabaseServer()
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabase
        .from('events')
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

    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
