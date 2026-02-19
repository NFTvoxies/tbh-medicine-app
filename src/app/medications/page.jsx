'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import MedicationCard from '@/components/medications/MedicationCard'
import { Search, Plus, Filter } from 'lucide-react'
import Link from 'next/link'
import { MEDICATION_FORMS } from '@/lib/types'

export default function MedicationsPage() {
    const [medications, setMedications] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const [filterForm, setFilterForm] = useState('all')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        async function loadData() {
            const [catRes] = await Promise.all([
                fetch('/api/categories').then((r) => r.json())
            ])
            setCategories(Array.isArray(catRes) ? catRes : [])
        }
        loadData()
    }, [])

    useEffect(() => {
        setLoading(true)
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (filterCategory !== 'all') params.set('category_id', filterCategory)
        if (filterForm !== 'all') params.set('form', filterForm)

        const timer = setTimeout(() => {
            fetch(`/api/medications?${params}`)
                .then((r) => r.json())
                .then((data) => {
                    setMedications(Array.isArray(data) ? data : [])
                    setLoading(false)
                })
                .catch(() => setLoading(false))
        }, 300)

        return () => clearTimeout(timer)
    }, [search, filterCategory, filterForm])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Medications</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {medications.length} medications registered
                    </p>
                </div>
                <Link href="/medications/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Medication
                    </Button>
                </Link>
            </div>

            {/* Search + Filters */}
            <div className="space-y-3">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by brand name or DCI..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-secondary/50"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowFilters(!showFilters)}
                        className={showFilters ? 'border-primary text-primary' : ''}
                    >
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>

                {showFilters && (
                    <div className="flex gap-3 flex-wrap animate-in fade-in slide-in-from-top-2 duration-200">
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-[200px] bg-secondary/50">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {'—'.repeat((c.level || 1) - 1)} {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterForm} onValueChange={setFilterForm}>
                            <SelectTrigger className="w-[180px] bg-secondary/50">
                                <SelectValue placeholder="Form" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Forms</SelectItem>
                                {MEDICATION_FORMS.map((f) => (
                                    <SelectItem key={f} value={f}>
                                        {f}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Medications grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-[120px] rounded-xl" />
                    ))}
                </div>
            ) : medications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No medications found</p>
                    <p className="text-sm mt-1">
                        Try a different search or{' '}
                        <Link href="/medications/new" className="text-primary hover:underline">
                            add a new medication
                        </Link>
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {medications.map((med) => (
                        <MedicationCard key={med.id} medication={med} />
                    ))}
                </div>
            )}
        </div>
    )
}
