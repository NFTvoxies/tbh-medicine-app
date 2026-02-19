'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { medicationSchema, MEDICATION_FORMS } from '@/lib/types'
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
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function MedicationForm({ onSubmit, defaultValues, loading }) {
    const [categories, setCategories] = useState([])
    const [molecules, setMolecules] = useState([])

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(medicationSchema),
        defaultValues: defaultValues || {
            brand_name: '',
            generic_name: '',
            molecule_id: null,
            category_id: null,
            dosage: '',
            form: '',
            notes: '',
        },
    })

    useEffect(() => {
        async function loadData() {
            const [catRes, molRes] = await Promise.all([
                fetch('/api/categories').then((r) => r.json()),
                fetch('/api/molecules').then((r) => r.json()),
            ])
            setCategories(Array.isArray(catRes) ? catRes : [])
            setMolecules(Array.isArray(molRes) ? molRes : [])
        }
        loadData()
    }, [])

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brand name */}
                <div className="space-y-2">
                    <Label htmlFor="brand_name">Brand Name *</Label>
                    <Input
                        id="brand_name"
                        placeholder="e.g. Doliprane"
                        {...register('brand_name')}
                        className="bg-secondary/50"
                    />
                    {errors.brand_name && (
                        <p className="text-xs text-destructive">
                            {errors.brand_name.message}
                        </p>
                    )}
                </div>

                {/* Generic name */}
                <div className="space-y-2">
                    <Label htmlFor="generic_name">Generic Name (DCI) *</Label>
                    <Input
                        id="generic_name"
                        placeholder="e.g. Paracetamol"
                        {...register('generic_name')}
                        className="bg-secondary/50"
                    />
                    {errors.generic_name && (
                        <p className="text-xs text-destructive">
                            {errors.generic_name.message}
                        </p>
                    )}
                </div>

                {/* Molecule */}
                <div className="space-y-2">
                    <Label>Molecule</Label>
                    <Select
                        onValueChange={(val) =>
                            setValue('molecule_id', val === 'none' ? null : val)
                        }
                        defaultValue={watch('molecule_id') || 'none'}
                    >
                        <SelectTrigger className="bg-secondary/50">
                            <SelectValue placeholder="Select molecule" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">— None —</SelectItem>
                            {molecules.length === 0 && (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                    No molecules.{' '}
                                    <Link href="/molecules" className="text-primary underline" target="_blank">
                                        Add molecules →
                                    </Link>
                                </div>
                            )}
                            {molecules.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                    {m.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <Label>Therapeutic Category</Label>
                    <Select
                        onValueChange={(val) =>
                            setValue('category_id', val === 'none' ? null : val)
                        }
                        defaultValue={watch('category_id') || 'none'}
                    >
                        <SelectTrigger className="bg-secondary/50">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">— None —</SelectItem>
                            {categories.length === 0 && (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                    No categories.{' '}
                                    <Link href="/categories" className="text-primary underline" target="_blank">
                                        Add categories →
                                    </Link>
                                </div>
                            )}
                            {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {'—'.repeat((c.level || 1) - 1)} {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Dosage */}
                <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input
                        id="dosage"
                        placeholder="e.g. 500mg, 1g"
                        {...register('dosage')}
                        className="bg-secondary/50"
                    />
                </div>

                {/* Form */}
                <div className="space-y-2">
                    <Label>Form</Label>
                    <Select
                        onValueChange={(val) =>
                            setValue('form', val === 'none' ? '' : val)
                        }
                        defaultValue={watch('form') || 'none'}
                    >
                        <SelectTrigger className="bg-secondary/50">
                            <SelectValue placeholder="Select form" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">— None —</SelectItem>
                            {MEDICATION_FORMS.map((f) => (
                                <SelectItem key={f} value={f}>
                                    {f}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>


            </div>

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    {...register('notes')}
                    className="bg-secondary/50 min-h-[80px]"
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {defaultValues ? 'Update Medication' : 'Create Medication'}
            </Button>
        </form>
    )
}
