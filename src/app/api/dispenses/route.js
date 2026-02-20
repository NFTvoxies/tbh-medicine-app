import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

/**
 * GET /api/dispenses
 *
 * Query params:
 *   event_id        UUID  — filter by a specific event
 *   medication_id   UUID  — filter by a specific medication
 *   dispensed_by    string — filter by staff name (case-insensitive contains)
 *   date_from       YYYY-MM-DD — dispense_date >= this
 *   date_to         YYYY-MM-DD — dispense_date <= this
 *   limit           number (default 200)
 *   offset          number (default 0)
 */
export async function GET(request) {
    const supabase = getSupabaseServer()
    const { searchParams } = new URL(request.url)

    const event_id = searchParams.get('event_id')
    const medication_id = searchParams.get('medication_id')
    const dispensed_by = searchParams.get('dispensed_by')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')
    const limit = Math.min(Number(searchParams.get('limit') || 200), 500)
    const offset = Number(searchParams.get('offset') || 0)

    let query = supabase
        .from('dispenses')
        .select(
            `
            id,
            dispense_date,
            quantity_units,
            dispensed_by,
            patient_info,
            notes,
            medications ( id, brand_name, generic_name, dosage, form ),
            batches ( id, expiration_date ),
            events ( id, name, location, event_date )
            `,
            { count: 'exact' }
        )
        .order('dispense_date', { ascending: false })
        .range(offset, offset + limit - 1)

    if (event_id) query = query.eq('event_id', event_id)
    if (medication_id) query = query.eq('medication_id', medication_id)
    if (dispensed_by) query = query.ilike('dispensed_by', `%${dispensed_by}%`)
    if (date_from) query = query.gte('dispense_date', date_from)
    if (date_to) query = query.lte('dispense_date', `${date_to}T23:59:59`)

    const { data, error, count } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ dispenses: data || [], total: count ?? 0 })
}
