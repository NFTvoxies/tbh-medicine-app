import { z } from 'zod'

// ── Zod Schemas ──────────────────────────────────────────

export const medicationSchema = z.object({
    brand_name: z.string().min(1, 'Brand name is required'),
    generic_name: z.string().min(1, 'Generic name (DCI) is required'),
    molecule_id: z.string().uuid().optional().nullable(),
    category_id: z.string().uuid().optional().nullable(),
    dosage: z.string().optional(),
    form: z.string().optional(),
    notes: z.string().optional(),
})

export const batchSchema = z.object({
    medication_id: z.string().uuid('Select a medication'),
    donation_id: z.string().uuid().optional().nullable(),
    location_id: z.string().uuid().optional().nullable(),
    expiration_date: z.string().optional(),
    quantity_units: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
})

export const donationSchema = z.object({
    donor_name: z.string().min(1, 'Donor name is required'),
    received_date: z.string().optional(),
    notes: z.string().optional(),
})

export const eventSchema = z.object({
    name: z.string().min(1, 'Event name is required'),
    event_date: z.string().min(1, 'Event date is required'),
    location: z.string().optional(),
    notes: z.string().optional(),
})

export const dispenseSchema = z.object({
    medication_id: z.string().uuid('Select a medication'),
    quantity_units: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
    batch_id: z.string().uuid().optional().nullable(),
    event_id: z.string().uuid().optional().nullable(),
    dispensed_by: z.string().optional(),
    // Flat fields collected from the UI — assembled into patient_info JSONB in onSubmit
    patient_age: z.coerce.number().int().min(0).max(130).optional().or(z.literal('')),
    patient_complaint: z.string().optional(),
    notes: z.string().optional(),
})

export const moleculeSchema = z.object({
    name: z.string().min(1, 'Molecule name is required'),
})

export const categorySchema = z.object({
    name: z.string().min(1, 'Category name is required'),
    parent_id: z.string().uuid().optional().nullable(),
    icon: z.string().optional(),
    level: z.coerce.number().int().default(1),
})

// ── Medication Forms (for dropdowns) ────────────────────

export const MEDICATION_FORMS = [
    'Comprimé',
    'Gélule',
    'Sachet',
    'Sirop',
    'Solution buvable',
    'Gouttes',
    'Injectable',
    'Suppositoire',
    'Pommade',
    'Crème',
    'Gel',
    'Collyre',
    'Spray nasal',
    'Inhalateur',
    'Patch',
    'Ovule',
]

// ── Helper: expiry status ───────────────────────────────

export function getExpiryStatus(expirationDate) {
    if (!expirationDate) return { label: 'No expiry', color: 'default', status: 'ok' }
    const now = new Date()
    const expiry = new Date(expirationDate)
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { label: 'Expired', color: 'destructive', status: 'expired' }
    if (diffDays <= 7) return { label: `${diffDays}d left`, color: 'destructive', status: 'critical' }
    if (diffDays <= 30) return { label: `${diffDays}d left`, color: 'warning', status: 'warning' }
    return { label: `${diffDays}d left`, color: 'default', status: 'ok' }
}

export function formatDate(dateString) {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}
