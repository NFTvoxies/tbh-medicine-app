'use client'

import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getExpiryStatus, formatDate } from '@/lib/types'

export default function ExpiryList({ medications = [] }) {
    // Flatten batches from all medications, add medication info
    const allBatches = medications.flatMap((med) =>
        (med.batches || [])
            .filter((b) => b.expiration_date)
            .map((b) => ({
                ...b,
                brand_name: med.brand_name,
                generic_name: med.generic_name,
                form: med.form,
                dosage: med.dosage,
                medication_id: med.id,
            }))
    )

    // Filter to only expiring/expired within 90 days
    const now = new Date()
    const expiring = allBatches
        .filter((b) => {
            const diff =
                (new Date(b.expiration_date) - now) / (1000 * 60 * 60 * 24)
            return diff <= 90
        })
        .sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date))
        .slice(0, 8)

    if (expiring.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No expiry warnings</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {expiring.map((batch) => {
                const status = getExpiryStatus(batch.expiration_date)
                return (
                    <div
                        key={batch.id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/50"
                    >
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{batch.brand_name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                                {batch.generic_name}
                                {batch.dosage ? ` · ${batch.dosage}` : ''}
                                {' · '}
                                {batch.quantity_units} units
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-xs text-muted-foreground">
                                {formatDate(batch.expiration_date)}
                            </span>
                            <Badge
                                variant={
                                    status.color === 'destructive' ? 'destructive' : 'secondary'
                                }
                                className={
                                    status.color === 'warning'
                                        ? 'bg-warning/10 text-warning border-warning/20'
                                        : ''
                                }
                            >
                                {status.label}
                            </Badge>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
