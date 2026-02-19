'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Calendar, MapPin, Download, Package, Syringe, Users, FileText } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/types'

export default function EventDetailPage({ params }) {
    const { id } = use(params)
    const [event, setEvent] = useState(null)
    const [dispenses, setDispenses] = useState([])
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        fetch(`/api/events/${id}`)
            .then((r) => {
                if (r.status === 404) { setNotFound(true); setLoading(false); return null }
                return r.json()
            })
            .then((data) => {
                if (!data) return
                setEvent(data.event)
                setDispenses(data.dispenses || [])
                setSummary(data.summary)
                setLoading(false)
            })
            .catch(() => { setNotFound(true); setLoading(false) })
    }, [id])

    // ── CSV Export ────────────────────────────────────────────────────
    function exportCSV() {
        const headers = ['Date', 'Medication', 'DCI', 'Dosage', 'Form', 'Boxes Dispensed', 'Dispensed By', 'Patient Age', 'Patient Complaint', 'Notes']
        const rows = dispenses.map((d) => [
            new Date(d.dispense_date).toLocaleString('fr-FR'),
            d.medications?.brand_name || '',
            d.medications?.generic_name || '',
            d.medications?.dosage || '',
            d.medications?.form || '',
            d.quantity_units,
            d.dispensed_by || '',
            d.patient_info?.age || '',
            d.patient_info?.complaint || '',
            d.notes || '',
        ])

        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n')

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `event-${event?.name?.replace(/\s+/g, '-') || id}-report.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
                <Skeleton className="h-[400px] rounded-xl" />
            </div>
        )
    }

    if (notFound || !event) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <p className="text-lg font-medium">Event not found</p>
                <Link href="/events" className="text-primary hover:underline mt-2">Back to events</Link>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/events">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(event.event_date)}
                            </span>
                            {event.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {event.location}
                                </span>
                            )}
                        </div>
                        {event.notes && (
                            <p className="text-xs text-muted-foreground mt-1 max-w-lg">{event.notes}</p>
                        )}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={exportCSV}
                    disabled={dispenses.length === 0}
                    className="shrink-0"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Summary stats */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-card border-border">
                        <CardContent className="pt-5 pb-4 text-center">
                            <Package className="w-5 h-5 text-primary mx-auto mb-2" />
                            <p className="text-3xl font-bold text-primary">{summary.total_boxes}</p>
                            <p className="text-xs text-muted-foreground mt-1">Boxes Dispensed</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardContent className="pt-5 pb-4 text-center">
                            <Syringe className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                            <p className="text-3xl font-bold">{summary.total_dispense_records}</p>
                            <p className="text-xs text-muted-foreground mt-1">Dispense Records</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardContent className="pt-5 pb-4 text-center">
                            <FileText className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                            <p className="text-3xl font-bold">{summary.unique_medications}</p>
                            <p className="text-xs text-muted-foreground mt-1">Unique Medications</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardContent className="pt-5 pb-4 text-center">
                            <Users className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                            <p className="text-3xl font-bold">{summary.unique_staff}</p>
                            <p className="text-xs text-muted-foreground mt-1">Staff Members</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Dispenses table */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Syringe className="w-4 h-4 text-primary" />
                        Dispense Log ({dispenses.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {dispenses.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Syringe className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No dispenses recorded for this event yet.</p>
                            <Link href={`/dispense`} className="text-primary hover:underline text-sm mt-1 block">
                                Go to Dispense →
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                                        <TableHead className="text-xs">Medication</TableHead>
                                        <TableHead className="text-xs">Form / Dosage</TableHead>
                                        <TableHead className="text-xs text-right">Boxes</TableHead>
                                        <TableHead className="text-xs">Patient Info</TableHead>
                                        <TableHead className="text-xs">Dispensed By</TableHead>
                                        <TableHead className="text-xs">Time</TableHead>
                                        <TableHead className="text-xs">Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dispenses.map((d) => (
                                        <TableRow key={d.id} className="hover:bg-secondary/10">
                                            <TableCell className="text-sm">
                                                <p className="font-medium">{d.medications?.brand_name || '—'}</p>
                                                <p className="text-xs text-muted-foreground">{d.medications?.generic_name}</p>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {[d.medications?.form, d.medications?.dosage].filter(Boolean).join(' · ') || '—'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="secondary" className="font-mono">
                                                    {d.quantity_units}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {d.patient_info ? (
                                                    <div className="space-y-0.5">
                                                        {d.patient_info.age && (
                                                            <p className="text-muted-foreground">Age: <span className="text-foreground">{d.patient_info.age}</span></p>
                                                        )}
                                                        {d.patient_info.complaint && (
                                                            <p className="text-muted-foreground">
                                                                <span className="text-foreground">{d.patient_info.complaint}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {d.dispensed_by || <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(d.dispense_date).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                                                {d.notes || '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
