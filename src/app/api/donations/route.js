import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET() {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
        .from('donations')
        .select(`
      *,
      batches ( id, quantity_units, medication_id, medications ( brand_name, generic_name ) )
    `)
        .order('received_date', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Enrich with totals
    const enriched = (data || []).map((d) => ({
        ...d,
        total_batches: (d.batches || []).length,
        total_units: (d.batches || []).reduce(
            (sum, b) => sum + (b.quantity_units || 0),
            0
        ),
    }))

    return NextResponse.json(enriched)
}

export async function POST(request) {
    const supabase = getSupabaseServer()
    const body = await request.json()

    const { donation, batches } = body

    // 1. Create donation
    const { data: donationData, error: donationError } = await supabase
        .from('donations')
        .insert(donation)
        .select()
        .single()

    if (donationError) {
        return NextResponse.json(
            { error: donationError.message },
            { status: 500 }
        )
    }

    // 2. Create batches linked to donation
    if (batches && batches.length > 0) {
        const batchesWithDonation = batches.map((b) => ({
            ...b,
            donation_id: donationData.id,
        }))

        const { error: batchError } = await supabase
            .from('batches')
            .insert(batchesWithDonation)

        if (batchError) {
            return NextResponse.json(
                { error: batchError.message },
                { status: 500 }
            )
        }
    }

    return NextResponse.json(donationData, { status: 201 })
}
