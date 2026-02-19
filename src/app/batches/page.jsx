'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, Layers, Search, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { formatDate, getExpiryStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'expired', label: 'Expired' },
    { value: 'critical', label: 'Expiring Soon (≤7d)' },
    { value: 'warning', label: 'Expiring (≤30d)' },
    { value: 'ok', label: 'OK' },
    { value: 'empty', label: 'Empty (0 qty)' },
]

function statusKey(batch) {
    if ((batch.quantity_units || 0) === 0) return 'empty'
    const s = getExpiryStatus(batch.expiration_date)
    return s.status // 'expired' | 'critical' | 'warning' | 'ok'
}

function StatusBadge({ batch }) {
    if ((batch.quantity_units || 0) === 0) {
        return <Badge variant="outline" className="text-muted-foreground text-xs">Empty</Badge>
    }
    const s = getExpiryStatus(batch.expiration_date)
    const colorMap = {
        expired: 'bg-destructive/20 text-destructive border-destructive/30',
        critical: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        ok: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    }
    return (
        <Badge variant="outline" className={cn('text-xs font-medium', colorMap[s.status])}>
            {s.label}
        </Badge>
    )
}

export default function BatchesPage() {
    const [batches, setBatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetch('/api/batches')
            .then((r) => r.json())
            .then((data) => {
                setBatches(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const filtered = useMemo(() => {
        return batches.filter((b) => {
            const medName = `${b.medications?.brand_name || ''} ${b.medications?.generic_name || ''}`.toLowerCase()
            const matchesSearch = !search || medName.includes(search.toLowerCase())
            const matchesStatus = statusFilter === 'all' || statusKey(b) === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [batches, search, statusFilter])

    // Summary counts
    const expiredCount = batches.filter((b) => statusKey(b) === 'expired').length
    const criticalCount = batches.filter((b) => statusKey(b) === 'critical').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Batches</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Stock overview — all batches across all medications.
                    </p>
                </div>
                <Link href="/batches/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Batch
                    </Button>
                </Link>
            </div>

            {/* Alerts */}
            {(expiredCount > 0 || criticalCount > 0) && !loading && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                        {expiredCount > 0 && <strong>{expiredCount} expired batch{expiredCount > 1 ? 'es' : ''}</strong>}
                        {expiredCount > 0 && criticalCount > 0 && ' and '}
                        {criticalCount > 0 && <strong>{criticalCount} expiring within 7 days</strong>}
                        {' — review your stock.'}
                    </span>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter by medication name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-secondary/50"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px] bg-secondary/50">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            {loading ? (
                <Skeleton className="h-[400px] rounded-xl" />
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Layers className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No batches found</p>
                    <p className="text-sm mt-1">
                        {search || statusFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : <Link href="/batches/new" className="text-primary hover:underline">Add your first batch</Link>}
                    </p>
                </div>
            ) : (
                <Card className="bg-card border-border">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                                        <TableHead className="text-xs">Medication</TableHead>
                                        <TableHead className="text-xs">Form / Dosage</TableHead>
                                        <TableHead className="text-xs text-right">Qty (boxes)</TableHead>
                                        <TableHead className="text-xs">Expiry</TableHead>
                                        <TableHead className="text-xs">Status</TableHead>
                                        <TableHead className="text-xs">Donation</TableHead>
                                        <TableHead className="text-xs">Location</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((b) => (
                                        <TableRow
                                            key={b.id}
                                            className="hover:bg-secondary/10 cursor-pointer"
                                            onClick={() => window.location.href = `/medications/${b.medication_id}`}
                                        >
                                            <TableCell className="text-sm">
                                                <p className="font-medium text-primary hover:underline">
                                                    {b.medications?.brand_name || '—'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {b.medications?.generic_name}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {[b.medications?.form, b.medications?.dosage].filter(Boolean).join(' · ') || '—'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-semibold text-sm">
                                                {b.quantity_units ?? 0}
                                            </TableCell>
                                            <TableCell className="text-sm whitespace-nowrap">
                                                {b.expiration_date ? formatDate(b.expiration_date) : <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge batch={b} />
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {b.donations?.donor_name || '—'}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {b.locations?.name || '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
                                Showing {filtered.length} of {batches.length} batches
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
