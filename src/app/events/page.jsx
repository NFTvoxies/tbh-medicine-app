'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Plus, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/types'

export default function EventsPage() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/events')
            .then((r) => r.json())
            .then((data) => {
                setEvents(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Events</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage caravan events and medical campaigns.
                    </p>
                </div>
                <Link href="/events/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Event
                    </Button>
                </Link>
            </div>

            {loading ? (
                <Skeleton className="h-[300px] rounded-xl" />
            ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Calendar className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No events yet</p>
                    <p className="text-sm mt-1">
                        <Link
                            href="/events/new"
                            className="text-primary hover:underline"
                        >
                            Create your first event
                        </Link>
                    </p>
                </div>
            ) : (
                <Card className="bg-card border-border">
                    <CardContent className="p-0">
                        <div className="rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                                        <TableHead className="text-xs">Name</TableHead>
                                        <TableHead className="text-xs">Date</TableHead>
                                        <TableHead className="text-xs">Location</TableHead>
                                        <TableHead className="text-xs">Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {events.map((e) => (
                                        <TableRow key={e.id} className="hover:bg-secondary/20">
                                            <TableCell className="font-medium text-sm">
                                                {e.name}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {formatDate(e.event_date)}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {e.location || '—'}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                                                {e.notes || '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
