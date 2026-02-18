'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { dispenseSchema } from '@/lib/types'
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
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, getExpiryStatus } from '@/lib/types'

export default function DispenseForm() {
    const [medications, setMedications] = useState([])
    const [events, setEvents] = useState([])
    const [batches, setBatches] = useState([])
    const [search, setSearch] = useState('')
    const [selectedMed, setSelectedMed] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null) // { success, message }

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(dispenseSchema),
        defaultValues: {
            medication_id: '',
            quantity_units: 1,
            batch_id: null,
            event_id: null,
            dispensed_by: '',
            notes: '',
        },
    })

    // Load events on mount
    useEffect(() => {
        fetch('/api/events')
            .then((r) => r.json())
            .then((data) => setEvents(Array.isArray(data) ? data : []))
    }, [])

    // Search medications via API (bypasses RLS)
    useEffect(() => {
        if (search.length < 2) {
            setMedications([])
            return
        }
        const timer = setTimeout(async () => {
            const res = await fetch(`/api/medications?search=${encodeURIComponent(search)}`)
            const data = await res.json()
            setMedications(Array.isArray(data) ? data.slice(0, 10) : [])
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    // Load batches when medication selected via API (bypasses RLS)
    useEffect(() => {
        if (!selectedMed) {
            setBatches([])
            return
        }
        fetch(`/api/batches?medication_id=${selectedMed.id}`)
            .then((r) => r.json())
            .then((data) => setBatches(Array.isArray(data) ? data.filter((b) => b.quantity_units > 0) : []))
    }, [selectedMed])

    function selectMedication(med) {
        setSelectedMed(med)
        setValue('medication_id', med.id)
        setSearch(med.brand_name)
        setMedications([])
    }

    async function onSubmit(data) {
        setLoading(true)
        setResult(null)
        try {
            const res = await fetch('/api/dispense', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    batch_id: data.batch_id === 'auto' ? null : data.batch_id,
                    patient_info: null,
                }),
            })
            const json = await res.json()
            if (!res.ok) {
                setResult({ success: false, message: json.error })
            } else {
                setResult({
                    success: true,
                    message: `Dispensed ${data.quantity_units} units successfully!`,
                })
                reset()
                setSelectedMed(null)
                setSearch('')
                setBatches([])
            }
        } catch (err) {
            setResult({ success: false, message: 'Network error, please try again.' })
        } finally {
            setLoading(false)
        }
    }

    const totalAvailable = batches.reduce(
        (sum, b) => sum + (b.quantity_units || 0),
        0
    )

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Result banner */}
            {result && (
                <div
                    className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg',
                        result.success
                            ? 'bg-success/10 text-success border border-success/20'
                            : 'bg-destructive/10 text-destructive border border-destructive/20'
                    )}
                >
                    {result.success ? (
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 shrink-0" />
                    )}
                    <p className="text-sm font-medium">{result.message}</p>
                </div>
            )}

            {/* Medication search */}
            <div className="space-y-2">
                <Label>Search Medication *</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Type brand name or DCI..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setSelectedMed(null)
                        }}
                        className="pl-9 bg-secondary/50"
                    />
                </div>
                {errors.medication_id && (
                    <p className="text-xs text-destructive">
                        {errors.medication_id.message}
                    </p>
                )}
                {/* Search results dropdown */}
                {medications.length > 0 && !selectedMed && (
                    <div className="rounded-lg border border-border bg-card p-1 space-y-0.5 max-h-[200px] overflow-y-auto">
                        {medications.map((med) => (
                            <button
                                type="button"
                                key={med.id}
                                onClick={() => selectMedication(med)}
                                className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary/50 transition-smooth"
                            >
                                <span className="text-sm font-medium">{med.brand_name}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                    {med.generic_name}
                                    {med.dosage ? ` · ${med.dosage}` : ''}
                                    {med.form ? ` · ${med.form}` : ''}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected medication info */}
            {selectedMed && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-primary">
                                {selectedMed.brand_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {selectedMed.generic_name}
                                {selectedMed.dosage ? ` · ${selectedMed.dosage}` : ''}
                                {selectedMed.form ? ` · ${selectedMed.form}` : ''}
                            </p>
                        </div>
                        <Badge variant="secondary" className="font-semibold">
                            {totalAvailable} units available
                        </Badge>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quantity */}
                <div className="space-y-2">
                    <Label htmlFor="quantity_units">Quantity to Dispense *</Label>
                    <Input
                        id="quantity_units"
                        type="number"
                        min={1}
                        max={totalAvailable || undefined}
                        {...register('quantity_units')}
                        className="bg-secondary/50"
                    />
                    {errors.quantity_units && (
                        <p className="text-xs text-destructive">
                            {errors.quantity_units.message}
                        </p>
                    )}
                </div>

                {/* Batch selection */}
                <div className="space-y-2">
                    <Label>Batch (Auto-FIFO if none)</Label>
                    <Select
                        onValueChange={(val) =>
                            setValue('batch_id', val === 'auto' ? null : val)
                        }
                        defaultValue="auto"
                    >
                        <SelectTrigger className="bg-secondary/50">
                            <SelectValue placeholder="Auto (FIFO)" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="auto">🔄 Auto FIFO (recommended)</SelectItem>
                            {batches.map((b) => {
                                const status = getExpiryStatus(b.expiration_date)
                                return (
                                    <SelectItem key={b.id} value={b.id}>
                                        {b.quantity_units} units · Exp: {formatDate(b.expiration_date)}{' '}
                                        ({status.label})
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                </div>

                {/* Event */}
                <div className="space-y-2">
                    <Label>Link to Event</Label>
                    <Select
                        onValueChange={(val) =>
                            setValue('event_id', val === 'none' ? null : val)
                        }
                        defaultValue="none"
                    >
                        <SelectTrigger className="bg-secondary/50">
                            <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">— No event —</SelectItem>
                            {events.map((e) => (
                                <SelectItem key={e.id} value={e.id}>
                                    {e.name} ({formatDate(e.event_date)})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Dispensed by */}
                <div className="space-y-2">
                    <Label htmlFor="dispensed_by">Dispensed By</Label>
                    <Input
                        id="dispensed_by"
                        placeholder="Staff name"
                        {...register('dispensed_by')}
                        className="bg-secondary/50"
                    />
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    placeholder="Patient info, reasons, etc."
                    {...register('notes')}
                    className="bg-secondary/50 min-h-[60px]"
                />
            </div>

            <Button
                type="submit"
                disabled={loading || !selectedMed}
                className="w-full md:w-auto"
            >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Dispense Medication
            </Button>
        </form>
    )
}
