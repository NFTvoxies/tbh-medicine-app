'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Pill,
    PackagePlus,
    Truck,
    Calendar,
    Syringe,
    ChevronLeft,
    ChevronRight,
    Heart,
    FlaskConical,
    Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'

const navItems = [
    {
        label: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
    },
    {
        label: 'Medications',
        href: '/medications',
        icon: Pill,
    },
    {
        label: 'Donations',
        href: '/donations',
        icon: PackagePlus,
    },
    {
        label: 'Batches',
        href: '/batches',
        icon: Truck,
    },
    {
        label: 'Events',
        href: '/events',
        icon: Calendar,
    },
    {
        label: 'Dispense',
        href: '/dispense',
        icon: Syringe,
    },
    {
        label: 'Molecules',
        href: '/molecules',
        icon: FlaskConical,
    },
    {
        label: 'Categories',
        href: '/categories',
        icon: Layers,
    },
]

export default function Sidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <aside
            className={cn(
                'hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out sticky top-0',
                collapsed ? 'w-[68px]' : 'w-[240px]'
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                    <Heart className="w-5 h-5 text-primary" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight">
                            TBH Medical
                        </h1>
                        <p className="text-[10px] text-muted-foreground">Stock Manager</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive =
                        item.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(item.href)
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth group',
                                isActive
                                    ? 'bg-primary/10 text-primary glow-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                            )}
                        >
                            <Icon
                                className={cn(
                                    'w-[18px] h-[18px] shrink-0',
                                    isActive
                                        ? 'text-primary'
                                        : 'text-muted-foreground group-hover:text-sidebar-foreground'
                                )}
                            />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            <Separator className="bg-sidebar-border" />

            {/* Collapse toggle */}
            <div className="p-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full justify-center text-muted-foreground hover:text-sidebar-foreground"
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </Button>
            </div>
        </aside>
    )
}
