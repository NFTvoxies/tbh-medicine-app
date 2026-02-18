'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, PackagePlus } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/types'

export default function DonationsPage() {
    const [donations, setDonations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/donations')
            .then((r) => r.json())
            .then((data) => {
                setDonations(Array.isArray(data) ? data : [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Donations</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track inbound medication donations.
                    </p>
                </div>
                <Link href="/donations/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Donation
                    </Button>
                </Link>
            </div>

            {loading ? (
                <Skeleton className="h-[300px] rounded-xl" />
            ) : donations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <PackagePlus className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No donations yet</p>
                    <p className="text-sm mt-1">
                        <Link
                            href="/donations/new"
                            className="text-primary hover:underline"
                        >
                            Record your first donation
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
                                        <TableHead className="text-xs">Donor</TableHead>
                                        <TableHead className="text-xs">Date</TableHead>
                                        <TableHead className="text-xs">Batches</TableHead>
                                        <TableHead className="text-xs">Total Units</TableHead>
                                        <TableHead className="text-xs">Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {donations.map((d) => (
                                        <TableRow key={d.id} className="hover:bg-secondary/20">
                                            <TableCell className="font-medium text-sm">
                                                {d.donor_name || 'Anonymous'}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {formatDate(d.received_date)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{d.total_batches}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-primary">
                                                    {d.total_units}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                                                {d.notes || '—'}
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
