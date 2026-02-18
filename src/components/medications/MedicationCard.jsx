import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Pill } from 'lucide-react'
import Link from 'next/link'
import { getExpiryStatus } from '@/lib/types'

export default function MedicationCard({ medication }) {
    const {
        id,
        brand_name,
        generic_name,
        dosage,
        form,
        total_units,
        batches,
        expiring_count,
        expired_count,
        therapeutic_categories,
        molecules,
    } = medication

    const isLow = total_units <= 10
    const isOutOfStock = total_units === 0

    // Find nearest expiry
    const nearestExpiry = (batches || [])
        .filter((b) => b.expiration_date && b.quantity_units > 0)
        .sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date))[0]

    const expiryStatus = nearestExpiry
        ? getExpiryStatus(nearestExpiry.expiration_date)
        : null

    return (
        <Link
            href={`/medications/${id}`}
            className={cn(
                'block rounded-xl bg-card border border-border p-4 transition-smooth hover:border-primary/30 hover:glow-primary group',
                isOutOfStock && 'opacity-60'
            )}
        >
            <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <Pill className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-smooth">
                                {brand_name}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                                {generic_name}
                                {molecules?.name ? ` (${molecules.name})` : ''}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <span
                                className={cn(
                                    'text-lg font-bold',
                                    isOutOfStock
                                        ? 'text-destructive'
                                        : isLow
                                            ? 'text-warning'
                                            : 'text-primary'
                                )}
                            >
                                {total_units}
                            </span>
                            <span className="text-[10px] text-muted-foreground">units</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {form && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {form}
                            </Badge>
                        )}
                        {dosage && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {dosage}
                            </Badge>
                        )}
                        {therapeutic_categories?.name && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {therapeutic_categories.name}
                            </Badge>
                        )}
                    </div>

                    {expiryStatus && expiryStatus.color !== 'default' && (
                        <div className="mt-2">
                            <Badge
                                variant={
                                    expiryStatus.color === 'destructive'
                                        ? 'destructive'
                                        : 'secondary'
                                }
                                className={cn(
                                    'text-[10px] px-1.5 py-0',
                                    expiryStatus.color === 'warning' &&
                                    'bg-warning/10 text-warning border-warning/20'
                                )}
                            >
                                ⏰ {expiryStatus.label}
                            </Badge>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}
