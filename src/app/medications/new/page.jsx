'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MedicationForm from '@/components/medications/MedicationForm'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NewMedicationPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(data) {
        setLoading(true)
        try {
            const res = await fetch('/api/medications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (res.ok) {
                router.push('/medications')
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/medications">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">New Medication</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Register a new medication in the system.
                    </p>
                </div>
            </div>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base">Medication Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <MedicationForm onSubmit={handleSubmit} loading={loading} />
                </CardContent>
            </Card>
        </div>
    )
}
