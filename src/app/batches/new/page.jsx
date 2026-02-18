'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { batchSchema } from '@/lib/types'
import { supabase } from '@/lib/supabaseClient' // still used for locations
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

function NewBatchForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const preselectedMed = searchParams.get('medication_id')

    const [loading, setLoading] = useState(false)
    const [medications, setMedications] = useState([])
    const [locations, setLocations] = useState([])

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(batchSchema),
        defaultValues: {
            medication_id: preselectedMed || '',
            quantity_units: 1,
            expiration_date: '',
            box_count: 0,
            donation_id: null,
            location_id: null,
        },
    })

    useEffect(() => {
        // Use API route for medications (bypasses RLS with service role key)
        fetch('/api/medications')
            .then((r) => r.json())
            .then((data) => setMedications(Array.isArray(data) ? data : []))
        // Locations via direct client (no RLS concern)
        supabase
            .from('locations')
            .select('*')
            .order('name')
            .then(({ data }) => setLocations(data || []))
    }, [])

    async function onSubmit(data) {
        setLoading(true)
        try {
            const res = await fetch('/api/batches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    expiration_date: data.expiration_date || null,
                }),
            })
            if (res.ok) {
                if (preselectedMed) {
                    router.push(`/medications/${preselectedMed}`)
                } else {
                    router.push('/medications')
                }
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Link href={preselectedMed ? `/medications/${preselectedMed}` : '/medications'}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add Batch</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Add inventory to an existing medication.
                    </p>
                </div>
            </div>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base">Batch Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Medication *</Label>
                                <Select
                                    defaultValue={preselectedMed || undefined}
                                    onValueChange={(val) => setValue('medication_id', val)}
                                >
                                    <SelectTrigger className="bg-secondary/50">
                                        <SelectValue placeholder="Select medication" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {medications.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>
                                                {m.brand_name} – {m.generic_name}
                                                {m.dosage ? ` (${m.dosage})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.medication_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.medication_id.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity_units">Quantity (units) *</Label>
                                <Input
                                    id="quantity_units"
                                    type="number"
                                    min={1}
                                    {...register('quantity_units')}
                                    className="bg-secondary/50"
                                />
                                {errors.quantity_units && (
                                    <p className="text-xs text-destructive">
                                        {errors.quantity_units.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expiration_date">Expiration Date</Label>
                                <Input
                                    id="expiration_date"
                                    type="date"
                                    {...register('expiration_date')}
                                    className="bg-secondary/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="box_count">Box Count</Label>
                                <Input
                                    id="box_count"
                                    type="number"
                                    min={0}
                                    {...register('box_count')}
                                    className="bg-secondary/50"
                                />
                            </div>

                            {locations.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Storage Location</Label>
                                    <Select
                                        onValueChange={(val) =>
                                            setValue('location_id', val === 'none' ? null : val)
                                        }
                                        defaultValue="none"
                                    >
                                        <SelectTrigger className="bg-secondary/50">
                                            <SelectValue placeholder="Select location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">— None —</SelectItem>
                                            {locations.map((l) => (
                                                <SelectItem key={l.id} value={l.id}>
                                                    {l.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Add Batch
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function NewBatchPage() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground">Loading...</div>}>
            <NewBatchForm />
        </Suspense>
    )
}
