'use client'

import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function LowStockList({ medications = [] }) {
    const lowStock = medications
        .filter((m) => m.total_units <= 10)
        .sort((a, b) => a.total_units - b.total_units)
        .slice(0, 8)

    if (lowStock.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <AlertTriangle className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No low stock alerts</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {lowStock.map((med) => (
                <Link
                    key={med.id}
                    href={`/medications/${med.id}`}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-smooth group"
                >
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-smooth">
                            {med.brand_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {med.generic_name}
                            {med.dosage ? ` · ${med.dosage}` : ''}
                            {med.form ? ` · ${med.form}` : ''}
                        </p>
                    </div>
                    <Badge
                        variant={med.total_units === 0 ? 'destructive' : 'secondary'}
                        className="shrink-0 ml-2"
                    >
                        {med.total_units} units
                    </Badge>
                </Link>
            ))}
        </div>
    )
}
