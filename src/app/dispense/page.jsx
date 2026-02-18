'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DispenseForm from '@/components/dispense/DispenseForm'
import { Syringe } from 'lucide-react'

export default function DispensePage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dispense Medication</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Search for a medication, choose quantity and batch, then dispense.
                </p>
            </div>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Syringe className="w-4 h-4 text-primary" />
                        Dispense Workflow
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DispenseForm />
                </CardContent>
            </Card>
        </div>
    )
}
