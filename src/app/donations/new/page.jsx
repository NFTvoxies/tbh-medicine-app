'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { donationSchema, batchSchema } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { DatePicker } from '@/components/ui/date-picker'

const donationFormSchema = z.object({
    donor_name: z.string().min(1, 'Donor name is required'),
    received_date: z.string().optional(),
    notes: z.string().optional(),
    batches: z
        .array(
            z.object({
                medication_id: z.string().min(1, 'Select a medication'),
                quantity_units: z.coerce.number().int().min(1, 'Min 1'),
                expiration_date: z.string().optional(),
            })
        )
        .min(1, 'Add at least one batch'),
})

export default function NewDonationPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [medications, setMedications] = useState([])

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(donationFormSchema),
        defaultValues: {
            donor_name: '',
            received_date: new Date().toISOString().split('T')[0],
            notes: '',
            batches: [
                { medication_id: '', quantity_units: 1, expiration_date: '' },
            ],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'batches',
    })

    useEffect(() => {
        fetch('/api/medications')
            .then((r) => r.json())
            .then((data) => setMedications(Array.isArray(data) ? data : []))
    }, [])

    async function onSubmit(data) {
        setLoading(true)
        try {
            const res = await fetch('/api/donations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    donation: {
                        donor_name: data.donor_name,
                        received_date: data.received_date || new Date().toISOString(),
                        notes: data.notes,
                    },
                    batches: data.batches.map((b) => ({
                        medication_id: b.medication_id,
                        quantity_units: b.quantity_units,
                        expiration_date: b.expiration_date || null,
                        box_count: b.quantity_units, // mirror: 1 unit = 1 box
                    })),
                }),
            })
            if (res.ok) {
                router.push('/donations')
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/donations">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">New Donation</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Record an inbound donation with batches.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Donation info */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-base">Donation Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="donor_name">Donor Name *</Label>
                                <Input
                                    id="donor_name"
                                    placeholder="e.g. Red Cross"
                                    {...register('donor_name')}
                                    className="bg-secondary/50"
                                />
                                {errors.donor_name && (
                                    <p className="text-xs text-destructive">
                                        {errors.donor_name.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Received Date</Label>
                                <DatePicker
                                    value={watch('received_date') || null}
                                    onChange={(val) => setValue('received_date', val || '')}
                                    placeholder="Select received date"
                                    clearable={false}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Notes about this donation..."
                                {...register('notes')}
                                className="bg-secondary/50 min-h-[60px]"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Batches */}
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base">Batches</CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                append({
                                    medication_id: '',
                                    quantity_units: 1,
                                    expiration_date: '',
                                })
                            }
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add Batch
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {errors.batches?.root && (
                            <p className="text-xs text-destructive">
                                {errors.batches.root.message}
                            </p>
                        )}
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="rounded-lg bg-secondary/20 border border-border p-4 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Batch #{index + 1}
                                    </span>
                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive hover:text-destructive"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Medication *</Label>
                                        <Select
                                            onValueChange={(val) =>
                                                setValue(`batches.${index}.medication_id`, val)
                                            }
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
                                        {errors.batches?.[index]?.medication_id && (
                                            <p className="text-xs text-destructive">
                                                {errors.batches[index].medication_id.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Number of Boxes *</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            {...register(`batches.${index}.quantity_units`)}
                                            className="bg-secondary/50"
                                        />
                                        <p className="text-[10px] text-muted-foreground">Each box = 1 dispensable unit</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Expiration Date</Label>
                                        <DatePicker
                                            value={watch(`batches.${index}.expiration_date`) || null}
                                            onChange={(val) => setValue(`batches.${index}.expiration_date`, val || '')}
                                            placeholder="Select expiry"
                                            fromYear={new Date().getFullYear()}
                                            toYear={new Date().getFullYear() + 15}
                                        />
                                    </div>

                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Donation
                </Button>
            </form>
        </div>
    )
}
