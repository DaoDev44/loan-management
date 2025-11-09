import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Loans</h1>
        <p className="text-muted-foreground">
          Manage your loan portfolio
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Management</CardTitle>
          <CardDescription>
            This page will display all loans with filtering and sorting capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Coming soon: Loan table with CRUD operations
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
