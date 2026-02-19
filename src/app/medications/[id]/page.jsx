'use client'

import { use, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import BatchList from '@/components/medications/BatchList'
import { ArrowLeft, Pill, Plus, Syringe } from 'lucide-react'
import Link from 'next/link'
import { getExpiryStatus } from '@/lib/types'

export default function MedicationDetailPage({ params }) {
    const { id } = use(params)
    const [medication, setMedication] = useState(null)
    const [batches, setBatches] = useState([])
    const [loading, setLoading] = useState(true)
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
                setBatches(data.batches || [])
                setLoading(false)
            })
            .catch(() => { setNotFound(true); setLoading(false) })
    }, [id])

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-[200px] rounded-xl" />
                <Skeleton className="h-[300px] rounded-xl" />
            </div>
        )
    }

    if (!medication) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <p className="text-lg font-medium">Medication not found</p>
                <Link href="/medications" className="text-primary hover:underline mt-2">
                    Back to medications
                </Link>
            </div>
        )
    }

    const totalUnits = batches.reduce((sum, b) => sum + (b.quantity_units || 0), 0)
    const activeBatches = batches.filter((b) => b.quantity_units > 0)

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/medications">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {medication.brand_name}
                        </h1>
                        <Badge variant="secondary">{medication.form || 'N/A'}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {medication.generic_name}
                        {medication.molecules?.name
                            ? ` (${medication.molecules.name})`
                            : ''}
                        {medication.dosage ? ` · ${medication.dosage}` : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/batches/new?medication_id=${id}`}>
                        <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" /> Add Batch
                        </Button>
                    </Link>
                    <Link href={`/dispense?medication=${id}`}>
                        <Button size="sm">
                            <Syringe className="w-4 h-4 mr-1" /> Dispense
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Overview card */}
            <Card className="bg-card border-border">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-3xl font-bold text-primary">{totalUnits}</p>
                            <p className="text-xs text-muted-foreground mt-1">Boxes in Stock</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{activeBatches.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">Active Batches</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{batches.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">Total Batches</p>
                        </div>
                        <div>
                            <p className="text-l font-bold">
                                {medication.therapeutic_categories?.name || '—'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Category</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {medication.notes && (
                <Card className="bg-card border-border">
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">{medication.notes}</p>
                    </CardContent>
                </Card>
            )}

            {/* Batches */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Pill className="w-4 h-4 text-primary" />
                        Batches ({batches.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <BatchList batches={batches} />
                </CardContent>
            </Card>
        </div>
    )
}
