'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Loan, LoanStatus } from '@prisma/client'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/status-badge'
import { LoadingState } from '@/components/shared/loading-state'
import { EmptyState } from '@/components/shared/empty-state'
import { LoanTableFilters } from './loan-table-filters'
import { LoanTablePagination } from './loan-table-pagination'

// Serialized loan type for client components (Decimal -> number)
export type SerializedLoan = Omit<Loan, 'principal' | 'balance'> & {
  principal: number
  balance: number
}

type SortColumn = 'borrowerName' | 'principal' | 'balance' | 'interestRate' | 'status' | 'startDate'
type SortOrder = 'asc' | 'desc' | null

interface LoanTableProps {
  loans: SerializedLoan[]
  isLoading?: boolean
}

export function LoanTable({ loans, isLoading }: LoanTableProps) {
  const router = useRouter()

  // Sorting state
  const [sortColumn, setSortColumn] = useState<SortColumn>('startDate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Filtering state
  const [statusFilter, setStatusFilter] = useState<LoanStatus[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Handle column sort
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null (default)
      if (sortOrder === 'asc') {
        setSortOrder('desc')
      } else if (sortOrder === 'desc') {
        setSortOrder(null)
        setSortColumn('startDate')
      }
    } else {
      setSortColumn(column)
      setSortOrder('asc')
    }
  }

  // Get sort icon
  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    if (sortOrder === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />
    }
    if (sortOrder === 'desc') {
      return <ArrowDown className="ml-2 h-4 w-4" />
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />
  }

  // Filter and sort loans
  const filteredAndSortedLoans = useMemo(() => {
    let result = [...loans]

    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter((loan) => statusFilter.includes(loan.status))
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (loan) =>
          loan.borrowerName.toLowerCase().includes(query) ||
          loan.borrowerEmail.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    if (sortColumn && sortOrder) {
      result.sort((a, b) => {
        let aValue: any = a[sortColumn]
        let bValue: any = b[sortColumn]

        // Handle Date types
        if (sortColumn === 'startDate') {
          aValue = new Date(a.startDate).getTime()
          bValue = new Date(b.startDate).getTime()
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [loans, statusFilter, searchQuery, sortColumn, sortOrder])

  // Paginate loans
  const paginatedLoans = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedLoans.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedLoans, currentPage, itemsPerPage])

  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedLoans.length / itemsPerPage)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  // Format percentage
  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(2)}%`
  }

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }).format(new Date(date))
  }

  // Handle row click
  const handleRowClick = (loanId: string) => {
    router.push(`/loans/${loanId}`)
  }

  if (isLoading) {
    return <LoadingState text="Loading loans..." size="lg" />
  }

  if (loans.length === 0) {
    return (
      <EmptyState
        title="No loans found"
        description="Get started by creating your first loan. You can add borrower details, loan amount, and payment terms."
        action={{
          label: 'Create Loan',
          onClick: () => router.push('/loans/new'),
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <LoanTableFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        totalCount={loans.length}
        filteredCount={filteredAndSortedLoans.length}
      />

      {filteredAndSortedLoans.length === 0 ? (
        <EmptyState
          title="No loans match your filters"
          description="Try adjusting your search or filter criteria to find what you're looking for."
        />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-muted/50"
                    onClick={() => handleSort('borrowerName')}
                  >
                    <div className="flex items-center">
                      Borrower
                      {getSortIcon('borrowerName')}
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-muted/50"
                    onClick={() => handleSort('principal')}
                  >
                    <div className="flex items-center">
                      Principal
                      {getSortIcon('principal')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-muted/50"
                    onClick={() => handleSort('balance')}
                  >
                    <div className="flex items-center">
                      Balance
                      {getSortIcon('balance')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-muted/50 hidden lg:table-cell"
                    onClick={() => handleSort('interestRate')}
                  >
                    <div className="flex items-center">
                      Rate
                      {getSortIcon('interestRate')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-muted/50"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-muted/50 hidden lg:table-cell"
                    onClick={() => handleSort('startDate')}
                  >
                    <div className="flex items-center">
                      Start Date
                      {getSortIcon('startDate')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLoans.map((loan) => (
                  <TableRow
                    key={loan.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(loan.id)}
                  >
                    <TableCell className="font-medium">{loan.borrowerName}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {loan.borrowerEmail}
                    </TableCell>
                    <TableCell>{formatCurrency(loan.principal)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(loan.balance)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatPercentage(loan.interestRate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={loan.status} size="sm" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatDate(loan.startDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <LoanTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredAndSortedLoans.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value)
              setCurrentPage(1) // Reset to first page
            }}
          />
        </>
      )}
    </div>
  )
}
