'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getExpiryStatus, formatDate } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Package } from 'lucide-react'

export default function BatchList({ batches = [] }) {
    if (batches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Package className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No batches found</p>
            </div>
        )
    }

    return (
        <div className="rounded-lg border border-border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                        <TableHead className="text-xs">Batch ID</TableHead>
                        <TableHead className="text-xs">Quantity</TableHead>
                        <TableHead className="text-xs">Expiry Date</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Donation</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {batches.map((batch) => {
                        const status = getExpiryStatus(batch.expiration_date)
                        return (
                            <TableRow key={batch.id} className="hover:bg-secondary/20">
                                <TableCell className="text-xs font-mono text-muted-foreground">
                                    {batch.id?.slice(0, 8)}…
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={cn(
                                            'font-semibold text-sm',
                                            batch.quantity_units === 0 && 'text-destructive'
                                        )}
                                    >
                                        {batch.quantity_units}
                                    </span>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {formatDate(batch.expiration_date)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            status.color === 'destructive'
                                                ? 'destructive'
                                                : 'secondary'
                                        }
                                        className={cn(
                                            'text-[10px]',
                                            status.color === 'warning' &&
                                            'bg-warning/10 text-warning border-warning/20'
                                        )}
                                    >
                                        {status.label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {batch.donations?.donor_name || '—'}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
