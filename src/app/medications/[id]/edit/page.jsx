'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import MedicationForm from '@/components/medications/MedicationForm'
import { ArrowLeft, Pencil } from 'lucide-react'
import Link from 'next/link'

export default function EditMedicationPage({ params }) {
    const { id } = use(params)
    const router = useRouter()
    const [medication, setMedication] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        fetch(`/api/medications/${id}`)
            .then((r) => {
                if (r.status === 404) { setNotFound(true); setLoading(false); return null }
                return r.json()
            })
            .then((data) => {
                if (!data) return
                setMedication(data.medication)
                setLoading(false)
            })
            .catch(() => { setNotFound(true); setLoading(false) })
    }, [id])

    async function handleSubmit(values) {
        setSaving(true)
        setError(null)
        try {
            const res = await fetch(`/api/medications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })
            const json = await res.json()
            if (!res.ok) {
                setError(json.error || 'Failed to update medication')
                setSaving(false)
                return
            }
            router.push(`/medications/${id}`)
        } catch {
            setError('Network error, please try again.')
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-[500px] rounded-xl" />
            </div>
        )
    }

    if (notFound || !medication) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <p className="text-lg font-medium">Medication not found</p>
                <Link href="/medications" className="text-primary hover:underline mt-2">Back to medications</Link>
            </div>
        )
    }

    // Map the medication data into the form shape (only the fields MedicationForm needs)
    const defaultValues = {
        brand_name: medication.brand_name || '',
        generic_name: medication.generic_name || '',
        molecule_id: medication.molecule_id || null,
        category_id: medication.category_id || null,
        dosage: medication.dosage || '',
        form: medication.form || '',
        notes: medication.notes || '',
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href={`/medications/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-primary" />
                        Edit Medication
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {medication.brand_name} · {medication.generic_name}
                    </p>
                </div>
            </div>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base">Medication Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm">
                            {error}
                        </div>
                    )}
                    <MedicationForm
                        onSubmit={handleSubmit}
                        defaultValues={defaultValues}
                        loading={saving}
                        submitLabel="Update Medication"
                    />
                </CardContent>
            </Card>
        </div>
    )
}
