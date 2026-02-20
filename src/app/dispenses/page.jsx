'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { DatePicker } from '@/components/ui/date-picker'
import {
    ClipboardList,
    Search,
    X,
    Download,
    CalendarDays,
    User,
    Package,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

const PAGE_SIZE = 50

function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('fr-MA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function formatDateTime(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('fr-MA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function DispenseHistoryPage() {
    // ── Filter state ──────────────────────────────────────────────────────
    const [eventId, setEventId] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [dispensedBy, setDispensedBy] = useState('')

    // ── Data state ────────────────────────────────────────────────────────
    const [dispenses, setDispenses] = useState([])
    const [total, setTotal] = useState(0)
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)

    // ── Fetch events once for the filter dropdown ─────────────────────────
    useEffect(() => {
        fetch('/api/events')
            .then((r) => r.json())
            .then((data) => setEvents(Array.isArray(data) ? data : []))
    }, [])

    // ── Fetch dispenses whenever filters / page change ────────────────────
    const fetchDispenses = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams({
            limit: String(PAGE_SIZE),
            offset: String(page * PAGE_SIZE),
        })
        if (eventId) params.set('event_id', eventId)
        if (dateFrom) params.set('date_from', dateFrom)
        if (dateTo) params.set('date_to', dateTo)
        if (dispensedBy.trim()) params.set('dispensed_by', dispensedBy.trim())

        try {
            const res = await fetch(`/api/dispenses?${params}`)
            const json = await res.json()
            setDispenses(json.dispenses || [])
            setTotal(json.total ?? 0)
        } finally {
            setLoading(false)
        }
    }, [eventId, dateFrom, dateTo, dispensedBy, page])

    useEffect(() => {
        fetchDispenses()
    }, [fetchDispenses])

    // Reset to page 0 when filters change
    function applyFilter(setter) {
        return (val) => {
            setPage(0)
            setter(val)
        }
    }

    function clearFilters() {
        setPage(0)
        setEventId('')
        setDateFrom('')
        setDateTo('')
        setDispensedBy('')
    }

    const hasFilters = eventId || dateFrom || dateTo || dispensedBy

    // ── CSV export ────────────────────────────────────────────────────────
    async function exportCSV() {
        // Fetch all (up to 500) with current filters for export
        const params = new URLSearchParams({ limit: '500', offset: '0' })
        if (eventId) params.set('event_id', eventId)
        if (dateFrom) params.set('date_from', dateFrom)
        if (dateTo) params.set('date_to', dateTo)
        if (dispensedBy.trim()) params.set('dispensed_by', dispensedBy.trim())

        const res = await fetch(`/api/dispenses?${params}`)
        const json = await res.json()
        const rows = json.dispenses || []

        const headers = [
            'Date',
            'Medication',
            'Generic Name',
            'Dosage',
            'Boxes',
            'Event',
            'Dispensed By',
            'Patient Age',
            'Patient Complaint',
            'Notes',
        ]

        const csvRows = rows.map((d) => [
            formatDateTime(d.dispense_date),
            d.medications?.brand_name || '',
            d.medications?.generic_name || '',
            d.medications?.dosage || '',
            d.quantity_units,
            d.events?.name || '',
            d.dispensed_by || '',
            d.patient_info?.age ?? '',
            d.patient_info?.complaint || '',
            (d.notes || '').replace(/"/g, '""'),
        ])

        const csv =
            '\uFEFF' + // UTF-8 BOM for Excel
            [headers, ...csvRows]
                .map((row) => row.map((c) => `"${c}"`).join(','))
                .join('\n')

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `dispense-history-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const totalPages = Math.ceil(total / PAGE_SIZE)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-primary" />
                        Dispense History
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Complete audit trail of all medication dispenses.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            {/* Filters */}
            <Card className="bg-card border-border">
                <CardContent className="pt-4 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Event filter */}
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" /> Event
                            </p>
                            <Select value={eventId || 'all'} onValueChange={applyFilter((v) => setEventId(v === 'all' ? '' : v))}>
                                <SelectTrigger className="bg-secondary/50 h-9 text-sm">
                                    <SelectValue placeholder="All events" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All events</SelectItem>
                                    {events.map((e) => (
                                        <SelectItem key={e.id} value={e.id}>
                                            {e.name} {e.event_date ? `(${formatDate(e.event_date)})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date from */}
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">From</p>
                            <DatePicker
                                value={dateFrom || null}
                                onChange={applyFilter((v) => setDateFrom(v || ''))}
                                placeholder="Start date"
                                className="h-9 text-sm"
                            />
                        </div>

                        {/* Date to */}
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">To</p>
                            <DatePicker
                                value={dateTo || null}
                                onChange={applyFilter((v) => setDateTo(v || ''))}
                                placeholder="End date"
                                className="h-9 text-sm"
                            />
                        </div>

                        {/* Dispensed by */}
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                <User className="w-3 h-3" /> Dispensed by
                            </p>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Staff name…"
                                    value={dispensedBy}
                                    onChange={(e) => applyFilter(setDispensedBy)(e.target.value)}
                                    className="pl-8 bg-secondary/50 h-9 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {hasFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-3 text-muted-foreground hover:text-foreground gap-1.5 h-7 px-2"
                            onClick={clearFilters}
                        >
                            <X className="w-3.5 h-3.5" />
                            Clear filters
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Results meta */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                    {loading ? (
                        <Skeleton className="h-4 w-32" />
                    ) : (
                        <>
                            <span className="text-foreground font-medium">{total}</span> records
                            {hasFilters && ' (filtered)'}
                        </>
                    )}
                </span>
                {totalPages > 1 && (
                    <span>
                        Page {page + 1} of {totalPages}
                    </span>
                )}
            </div>

            {/* Table */}
            <Card className="bg-card border-border">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(8)].map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : dispenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <Package className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No dispense records found</p>
                            <p className="text-sm mt-1">
                                {hasFilters
                                    ? 'Try adjusting or clearing your filters.'
                                    : 'Dispenses will appear here once medications are issued.'}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-xs font-semibold text-muted-foreground w-[140px]">Date</TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground">Medication</TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground text-center w-20">Boxes</TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground">Event</TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground">Dispensed By</TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground">Patient</TableHead>
                                    <TableHead className="text-xs font-semibold text-muted-foreground">Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dispenses.map((d) => (
                                    <TableRow key={d.id} className="border-border hover:bg-secondary/10 transition-colors">
                                        {/* Date */}
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDateTime(d.dispense_date)}
                                        </TableCell>

                                        {/* Medication */}
                                        <TableCell>
                                            {d.medications ? (
                                                <Link
                                                    href={`/medications/${d.medications.id}`}
                                                    className="hover:underline"
                                                >
                                                    <p className="text-sm font-medium text-primary leading-tight">
                                                        {d.medications.brand_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {d.medications.generic_name}
                                                        {d.medications.dosage ? ` · ${d.medications.dosage}` : ''}
                                                    </p>
                                                </Link>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                        </TableCell>

                                        {/* Boxes */}
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="font-mono text-xs">
                                                ×{d.quantity_units}
                                            </Badge>
                                        </TableCell>

                                        {/* Event */}
                                        <TableCell>
                                            {d.events ? (
                                                <Link
                                                    href={`/events/${d.events.id}`}
                                                    className="text-xs text-primary hover:underline leading-tight block"
                                                >
                                                    {d.events.name}
                                                    {d.events.location && (
                                                        <span className="text-muted-foreground block">
                                                            {d.events.location}
                                                        </span>
                                                    )}
                                                </Link>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">No event</span>
                                            )}
                                        </TableCell>

                                        {/* Dispensed by */}
                                        <TableCell className="text-sm">
                                            {d.dispensed_by || (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                        </TableCell>

                                        {/* Patient info */}
                                        <TableCell>
                                            {d.patient_info?.age || d.patient_info?.complaint ? (
                                                <div className="text-xs space-y-0.5">
                                                    {d.patient_info.age && (
                                                        <p className="text-foreground font-medium">
                                                            {d.patient_info.age} yrs
                                                        </p>
                                                    )}
                                                    {d.patient_info.complaint && (
                                                        <p className="text-muted-foreground max-w-[140px] truncate" title={d.patient_info.complaint}>
                                                            {d.patient_info.complaint}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                        </TableCell>

                                        {/* Notes */}
                                        <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate" title={d.notes || ''}>
                                            {d.notes || '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 0}
                        onClick={() => setPage((p) => p - 1)}
                        className="gap-1.5"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                        {page + 1} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => p + 1)}
                        className="gap-1.5"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}
