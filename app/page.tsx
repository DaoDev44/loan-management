import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your loan management platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Loans</CardTitle>
            <CardDescription>Active loan portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-muted-foreground mt-2">
              Coming soon: Real-time metrics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Outstanding</CardTitle>
            <CardDescription>Total amount owed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$0.00</p>
            <p className="text-xs text-muted-foreground mt-2">
              Coming soon: Balance calculations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$0.00</p>
            <p className="text-xs text-muted-foreground mt-2">
              Coming soon: Payment tracking
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>
            Get started with your loan management platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            ✓ Database configured and running
          </p>
          <p className="text-sm text-muted-foreground">
            ✓ Server actions implemented for loans and payments
          </p>
          <p className="text-sm text-muted-foreground">
            ✓ UI components ready with shadcn/ui
          </p>
          <p className="text-sm text-muted-foreground">
            ✓ Navigation and layout complete
          </p>
          <p className="text-sm font-medium mt-4">
            Next: Build the loan table and forms
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
