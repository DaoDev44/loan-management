'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, Users, Receipt, FileQuestion } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { MetricsCard } from '@/components/shared/metrics-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingState } from '@/components/shared/loading-state'

export default function TestSharedComponentsPage() {
  const [showLoading, setShowLoading] = useState(false)

  return (
    <div className="container mx-auto p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Shared Components Test Page
        </h1>
        <p className="text-muted-foreground">
          Testing all custom shared components (MetricsCard, StatusBadge, EmptyState, LoadingState)
        </p>
      </div>

      <Separator />

      {/* MetricsCard */}
      <Card>
        <CardHeader>
          <CardTitle>MetricsCard Component</CardTitle>
          <CardDescription>Display key metrics with trends and loading states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-4">Default Metrics</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricsCard
                title="Total Loans"
                value="$245,000"
                icon={DollarSign}
                description="Active loan portfolio"
                trend={{ value: 12.5, isPositive: true }}
              />
              <MetricsCard
                title="Outstanding Balance"
                value="$189,500"
                icon={TrendingUp}
                description="Remaining balances"
                trend={{ value: 8.2, isPositive: false }}
              />
              <MetricsCard
                title="Total Borrowers"
                value={42}
                icon={Users}
                description="Active borrowers"
              />
              <MetricsCard
                title="Payments This Month"
                value="$28,750"
                icon={Receipt}
                description="Received in January"
                trend={{ value: 15.3, isPositive: true }}
              />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-4">Loading State</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricsCard
                title="Loading"
                value="0"
                icon={DollarSign}
                isLoading={true}
              />
              <MetricsCard
                title="Loading"
                value="0"
                icon={Users}
                isLoading={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* StatusBadge */}
      <Card>
        <CardHeader>
          <CardTitle>StatusBadge Component</CardTitle>
          <CardDescription>Status indicators with different sizes and colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-4">All Status Types (Medium)</h3>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="ACTIVE" />
              <StatusBadge status="COMPLETED" />
              <StatusBadge status="DEFAULTED" />
              <StatusBadge status="PENDING" />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-4">Size Variants</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-16">Small:</span>
                <StatusBadge status="ACTIVE" size="sm" />
                <StatusBadge status="COMPLETED" size="sm" />
                <StatusBadge status="DEFAULTED" size="sm" />
                <StatusBadge status="PENDING" size="sm" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-16">Medium:</span>
                <StatusBadge status="ACTIVE" size="md" />
                <StatusBadge status="COMPLETED" size="md" />
                <StatusBadge status="DEFAULTED" size="md" />
                <StatusBadge status="PENDING" size="md" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-16">Large:</span>
                <StatusBadge status="ACTIVE" size="lg" />
                <StatusBadge status="COMPLETED" size="lg" />
                <StatusBadge status="DEFAULTED" size="lg" />
                <StatusBadge status="PENDING" size="lg" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EmptyState */}
      <Card>
        <CardHeader>
          <CardTitle>EmptyState Component</CardTitle>
          <CardDescription>Display when there's no data to show</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-4">With Action Button</h3>
            <EmptyState
              icon={FileQuestion}
              title="No loans found"
              description="Get started by creating your first loan. You can add borrower details, loan amount, and payment terms."
              action={{
                label: 'Create Loan',
                onClick: () => alert('Navigate to create loan form'),
              }}
            />
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-4">Without Action</h3>
            <EmptyState
              icon={Receipt}
              title="No payments yet"
              description="Payments will appear here once borrowers start making payments on their loans."
            />
          </div>
        </CardContent>
      </Card>

      {/* LoadingState */}
      <Card>
        <CardHeader>
          <CardTitle>LoadingState Component</CardTitle>
          <CardDescription>Loading indicators with different sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h3 className="text-sm font-medium mb-4">Toggle Loading</h3>
            <Button onClick={() => setShowLoading(!showLoading)}>
              {showLoading ? 'Hide Loading' : 'Show Loading'}
            </Button>
          </div>

          {showLoading && (
            <>
              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-4">Small</h3>
                <LoadingState text="Loading data..." size="sm" />
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-4">Medium (Default)</h3>
                <LoadingState text="Loading loans..." size="md" />
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-4">Large</h3>
                <LoadingState text="Processing payment..." size="lg" />
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-4">Without Text</h3>
                <LoadingState />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
