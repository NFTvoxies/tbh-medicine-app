import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function POST(request) {
    const supabase = getSupabaseServer()
    const body = await request.json()

    const {
        medication_id,
        quantity_units,
        batch_id = null,
        event_id = null,
        dispensed_by = null,
        patient_info = null,
        notes = null,
    } = body

    if (!medication_id || !quantity_units || quantity_units <= 0) {
        return NextResponse.json(
            { error: 'medication_id and positive quantity_units are required' },
            { status: 400 }
        )
    }

    // Call the process_dispense RPC
    const { data, error } = await supabase.rpc('process_dispense', {
        p_medication_id: medication_id,
        p_quantity_units: quantity_units,
        p_batch_id: batch_id,
        p_event_id: event_id,
        p_dispensed_by: dispensed_by,
        p_patient_info: patient_info,
        p_notes: notes,
    })

    if (error) {
        // User-friendly error messages
        let message = error.message
        if (message.includes('not enough stock')) {
            message = 'Not enough stock to fulfill this dispense.'
        } else if (message.includes('not enough units')) {
            message = 'Selected batch does not have enough units.'
        } else if (message.includes('quantity must be positive')) {
            message = 'Quantity must be a positive number.'
        }
        return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({
        success: true,
        dispenses: data,
    })
}
