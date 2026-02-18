'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventSchema } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewEventPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            name: '',
            event_date: new Date().toISOString().split('T')[0],
            location: '',
            notes: '',
        },
    })

    async function onSubmit(data) {
        setLoading(true)
        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (res.ok) {
                router.push('/events')
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/events">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">New Event</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create a new caravan or medical campaign event.
                    </p>
                </div>
            </div>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base">Event Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Event Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Caravane Taza 2026"
                                    {...register('name')}
                                    className="bg-secondary/50"
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="event_date">Event Date *</Label>
                                <Input
                                    id="event_date"
                                    type="date"
                                    {...register('event_date')}
                                    className="bg-secondary/50"
                                />
                                {errors.event_date && (
                                    <p className="text-xs text-destructive">
                                        {errors.event_date.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="e.g. Village Center, Taza"
                                {...register('location')}
                                className="bg-secondary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Event details..."
                                {...register('notes')}
                                className="bg-secondary/50 min-h-[80px]"
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Event
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
