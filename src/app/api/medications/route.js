import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET(request) {
    const supabase = getSupabaseServer()
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('category_id')
    const moleculeId = searchParams.get('molecule_id')
    const form = searchParams.get('form')

    let query = supabase
        .from('medications')
        .select(`
      *,
      molecules ( id, name ),
      therapeutic_categories ( id, name ),
      batches ( id, quantity_units, expiration_date )
    `)
        .order('brand_name', { ascending: true })

    if (search) {
        query = query.or(
            `brand_name.ilike.%${search}%,generic_name.ilike.%${search}%`
        )
    }
    if (categoryId) query = query.eq('category_id', categoryId)
    if (moleculeId) query = query.eq('molecule_id', moleculeId)
    if (form) query = query.eq('form', form)

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Compute totals client-side from batches
    const enriched = (data || []).map((med) => {
        const batches = med.batches || []
        const totalUnits = batches.reduce((sum, b) => sum + (b.quantity_units || 0), 0)
        const now = new Date()
        const expiringBatches = batches.filter((b) => {
            if (!b.expiration_date) return false
            const diff = (new Date(b.expiration_date) - now) / (1000 * 60 * 60 * 24)
            return diff <= 90 && diff >= 0
        })
        const expiredBatches = batches.filter((b) => {
            if (!b.expiration_date) return false
            return new Date(b.expiration_date) < now
        })
        return {
            ...med,
            total_units: totalUnits,
            expiring_count: expiringBatches.length,
            expired_count: expiredBatches.length,
        }
    })

    return NextResponse.json(enriched)
}

export async function POST(request) {
    const supabase = getSupabaseServer()
    const body = await request.json()

    const { data, error } = await supabase
        .from('medications')
        .insert(body)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
