'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    Menu,
    Search,
    Bell,
    Heart,
    LayoutDashboard,
    Pill,
    PackagePlus,
    Truck,
    Calendar,
    Syringe,
} from 'lucide-react'
import { useState } from 'react'

const mobileNavItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Medications', href: '/medications', icon: Pill },
    { label: 'Donations', href: '/donations', icon: PackagePlus },
    { label: 'Batches', href: '/batches/new', icon: Truck },
    { label: 'Events', href: '/events', icon: Calendar },
    { label: 'Dispense', href: '/dispense', icon: Syringe },
]

const pageTitles = {
    '/': 'Dashboard',
    '/medications': 'Medications',
    '/medications/new': 'New Medication',
    '/donations': 'Donations',
    '/donations/new': 'New Donation',
    '/batches/new': 'Add Batch',
    '/events': 'Events',
    '/events/new': 'New Event',
    '/dispense': 'Dispense',
    '/auth/login': 'Login',
}

export default function Navbar() {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    // Get page title from pathname
    const pageTitle =
        pageTitles[pathname] ||
        (pathname.startsWith('/medications/') ? 'Medication Detail' : 'TBH Medical')

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-lg">
            <div className="flex items-center justify-between h-16 px-4 md:px-6">
                {/* Left: Mobile menu + Page title */}
                <div className="flex items-center gap-3">
                    {/* Mobile hamburger */}
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden text-muted-foreground"
                            >
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[260px] p-0 bg-sidebar">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            {/* Mobile sidebar content */}
                            <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
                                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                                    <Heart className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight">
                                        TBH Medical
                                    </h1>
                                    <p className="text-[10px] text-muted-foreground">
                                        Stock Manager
                                    </p>
                                </div>
                            </div>
                            <nav className="py-4 px-2 space-y-1">
                                {mobileNavItems.map((item) => {
                                    const isActive =
                                        item.href === '/'
                                            ? pathname === '/'
                                            : pathname.startsWith(item.href)
                                    const Icon = item.icon
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth',
                                                isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                                            )}
                                        >
                                            <Icon className="w-[18px] h-[18px] shrink-0" />
                                            <span>{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <h2 className="text-lg font-semibold tracking-tight">{pageTitle}</h2>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Search className="w-[18px] h-[18px]" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative text-muted-foreground hover:text-foreground"
                    >
                        <Bell className="w-[18px] h-[18px]" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full pulse-dot" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
