'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { medicationSchema, MEDICATION_FORMS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SearchableSelect } from '@/components/ui/searchable-select'
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

    // Build option lists
    const moleculeOptions = molecules.map((m) => ({ value: m.id, label: m.name }))
    const categoryOptions = categories.map((c) => ({
        value: c.id,
        label: `${'—'.repeat((c.level || 1) - 1)}${(c.level || 1) > 1 ? ' ' : ''}${c.name}`,
    }))
    const formOptions = MEDICATION_FORMS.map((f) => ({ value: f, label: f }))

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

                {/* Molecule — searchable combobox */}
                <div className="space-y-2">
                    <Label>Molecule</Label>
                    {molecules.length === 0 ? (
                        <p className="text-xs text-muted-foreground pt-1">
                            No molecules yet.{' '}
                            <Link href="/molecules" className="text-primary underline" target="_blank">
                                Add molecules →
                            </Link>
                        </p>
                    ) : (
                        <SearchableSelect
                            options={moleculeOptions}
                            value={watch('molecule_id')}
                            onChange={(val) => setValue('molecule_id', val)}
                            placeholder="— None —"
                            searchPlaceholder="Search molecule…"
                            emptyMessage="No molecule found."
                        />
                    )}
                </div>

                {/* Therapeutic Category — searchable combobox */}
                <div className="space-y-2">
                    <Label>Therapeutic Category</Label>
                    {categories.length === 0 ? (
                        <p className="text-xs text-muted-foreground pt-1">
                            No categories yet.{' '}
                            <Link href="/categories" className="text-primary underline" target="_blank">
                                Add categories →
                            </Link>
                        </p>
                    ) : (
                        <SearchableSelect
                            options={categoryOptions}
                            value={watch('category_id')}
                            onChange={(val) => setValue('category_id', val)}
                            placeholder="— None —"
                            searchPlaceholder="Search category…"
                            emptyMessage="No category found."
                        />
                    )}
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

                {/* Form — searchable combobox */}
                <div className="space-y-2">
                    <Label>Form</Label>
                    <SearchableSelect
                        options={formOptions}
                        value={watch('form') || null}
                        onChange={(val) => setValue('form', val || '')}
                        placeholder="— None —"
                        searchPlaceholder="Search form…"
                        emptyMessage="No form found."
                    />
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
