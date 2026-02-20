'use client'

import { useEffect, useState } from 'react'
import StatCard from '@/components/dashboard/StatCard'
import LowStockList from '@/components/dashboard/LowStockList'
import ExpiryList from '@/components/dashboard/ExpiryList'
import { Pill, Package, AlertTriangle, Clock, Activity, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const [medications, setMedications] = useState([])
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [medRes, donationRes] = await Promise.all([
          fetch('/api/medications'),
          fetch('/api/donations'),
        ])
        const medData = await medRes.json()
        setMedications(Array.isArray(medData) ? medData : [])
        const donationData = await donationRes.json()
        setDonations(Array.isArray(donationData) ? donationData : [])
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    )
  }

  const totalMeds = medications.length
  const totalUnits = medications.reduce((sum, m) => sum + (m.total_units || 0), 0)
  const lowStockCount = medications.filter((m) => m.total_units <= 10 && m.total_units > 0).length
  const outOfStock = medications.filter((m) => m.total_units === 0).length

  // Count expiring (within 90 days)
  const now = new Date()
  const expiringBatches = medications.flatMap((m) =>
    (m.batches || []).filter((b) => {
      if (!b.expiration_date) return false
      const diff = (new Date(b.expiration_date) - now) / (1000 * 60 * 60 * 24)
      return diff <= 90 && diff >= 0
    })
  )

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s your medical stock overview.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Medications"
          value={totalMeds}
          subtitle={`${totalUnits.toLocaleString()} total units`}
          icon={Pill}
        />
        <StatCard
          title="Total Donations"
          value={donations.length}
          subtitle="Inbound records"
          icon={Package}
        />
        <StatCard
          title="Low Stock"
          value={lowStockCount}
          subtitle={`${outOfStock} out of stock`}
          icon={AlertTriangle}
          className={lowStockCount > 0 ? 'border-warning/30' : ''}
        />
        <StatCard
          title="Expiring Soon"
          value={expiringBatches.length}
          subtitle="Batches within 90 days"
          icon={Clock}
          className={expiringBatches.length > 0 ? 'border-destructive/30' : ''}
        />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LowStockList medications={medications} />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-destructive" />
              Expiry Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpiryList medications={medications} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
