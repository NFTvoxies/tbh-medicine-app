'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Loader2, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CategoriesPage() {
    const [categories, setCategories] = useState([])
    const [name, setName] = useState('')
    const [parentId, setParentId] = useState('none')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    async function load() {
        setFetching(true)
        const res = await fetch('/api/categories')
        const data = await res.json()
        setCategories(Array.isArray(data) ? data : [])
        setFetching(false)
    }

    useEffect(() => {
        async function fetchCategories() {
            setFetching(true)
            const res = await fetch('/api/categories')
            const data = await res.json()
            setCategories(Array.isArray(data) ? data : [])
            setFetching(false)
        }
        fetchCategories()
    }, [])

    async function handleAdd(e) {
        e.preventDefault()
        if (!name.trim()) return
        setLoading(true)
        const parent = categories.find((c) => c.id === parentId)
        const level = parent ? (parent.level || 1) + 1 : 1
        await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name.trim(),
                parent_id: parentId === 'none' ? null : parentId,
                level,
            }),
        })
        setName('')
        setParentId('none')
        setLoading(false)
        load()
    }

    async function handleDelete(id) {
        await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
        load()
    }

    // Build tree display
    const rootCategories = categories.filter((c) => !c.parent_id)
    const getChildren = (parentId) =>
        categories.filter((c) => c.parent_id === parentId)

    function renderCategory(cat, depth = 0) {
        const children = getChildren(cat.id)
        return (
            <div key={cat.id}>
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                        <span
                            className="text-muted-foreground text-xs"
                            style={{ marginLeft: depth * 16 }}
                        >
                            {depth > 0 ? '└─' : ''}
                        </span>
                        <Badge
                            variant="outline"
                            className={cn(
                                'text-[10px] px-1.5',
                                depth === 0 ? 'border-primary/40 text-primary' : ''
                            )}
                        >
                            L{cat.level || 1}
                        </Badge>
                        <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(cat.id)}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
                {children.map((child) => renderCategory(child, depth + 1))}
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Therapeutic Categories
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Hierarchical classification of medications.
                </p>
            </div>

            {/* Add form */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base">Add Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="cat-name">Category Name</Label>
                                <Input
                                    id="cat-name"
                                    placeholder="e.g. Cardiology, Anti-hypertension"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-secondary/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Parent Category (optional)</Label>
                                <Select value={parentId} onValueChange={setParentId}>
                                    <SelectTrigger className="bg-secondary/50">
                                        <SelectValue placeholder="Top level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">— Top level —</SelectItem>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {'—'.repeat((c.level || 1) - 1)} {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button type="submit" disabled={loading || !name.trim()} size="sm">
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4 mr-2" />
                            )}
                            Add Category
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Tree list */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        Categories ({categories.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {fetching ? (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : categories.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            No categories yet. Add your first one above.
                        </p>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {rootCategories.map((cat) => renderCategory(cat, 0))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
