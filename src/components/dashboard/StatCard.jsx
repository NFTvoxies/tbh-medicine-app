import { cn } from '@/lib/utils'

export default function StatCard({ title, value, subtitle, icon: Icon, trend, className }) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl bg-card border border-border p-5 transition-smooth hover:border-primary/30 hover:glow-primary group',
                className
            )}
        >
            {/* Background gradient accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8 group-hover:bg-primary/10 transition-smooth" />

            <div className="relative flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {title}
                    </p>
                    <p className="text-3xl font-bold tracking-tight">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                    )}
                    {trend && (
                        <p
                            className={cn(
                                'text-xs font-medium',
                                trend.positive ? 'text-success' : 'text-destructive'
                            )}
                        >
                            {trend.positive ? '↑' : '↓'} {trend.label}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    )
}
