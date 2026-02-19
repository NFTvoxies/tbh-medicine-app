'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, Loader2, FlaskConical } from 'lucide-react'

export default function MoleculesPage() {
    const [molecules, setMolecules] = useState([])
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    async function load() {
        setFetching(true)
        const res = await fetch('/api/molecules')
        const data = await res.json()
        setMolecules(Array.isArray(data) ? data : [])
        setFetching(false)
    }

    useEffect(() => {
        async function fetchMolecules() {
            setFetching(true)
            const res = await fetch('/api/molecules')
            const data = await res.json()
            setMolecules(Array.isArray(data) ? data : [])
            setFetching(false)
        }
        fetchMolecules()
    }, [])

    async function handleAdd(e) {
        e.preventDefault()
        if (!name.trim()) return
        setLoading(true)
        await fetch('/api/molecules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim() }),
        })
        setName('')
        setLoading(false)
        load()
    }

    async function handleDelete(id) {
        await fetch(`/api/molecules?id=${id}`, { method: 'DELETE' })
        load()
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Molecules (DCI)</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage active pharmaceutical ingredients.
                </p>
            </div>

            {/* Add form */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base">Add Molecule</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="flex gap-3">
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="mol-name">Molecule Name (DCI)</Label>
                            <Input
                                id="mol-name"
                                placeholder="e.g. Paracetamol, Amoxicillin"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-secondary/50"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" disabled={loading || !name.trim()}>
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* List */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-primary" />
                        Molecules ({molecules.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {fetching ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : molecules.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            No molecules yet. Add your first one above.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {molecules.map((m, i) => (
                                <div key={m.id}>
                                    {i > 0 && <Separator className="bg-border/50" />}
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs font-mono">
                                                DCI
                                            </Badge>
                                            <span className="text-sm font-medium">{m.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDelete(m.id)}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
