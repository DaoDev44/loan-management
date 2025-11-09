'use client'

import { useState } from 'react'
import { LoanStatus } from '@prisma/client'
import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LoanTableFiltersProps {
  statusFilter: LoanStatus[]
  onStatusFilterChange: (statuses: LoanStatus[]) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  totalCount: number
  filteredCount: number
}

const STATUS_OPTIONS: { value: LoanStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'DEFAULTED', label: 'Defaulted' },
]

export function LoanTableFilters({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  totalCount,
  filteredCount,
}: LoanTableFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)

  // Toggle status filter
  const toggleStatus = (status: LoanStatus) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter((s) => s !== status))
    } else {
      onStatusFilterChange([...statusFilter, status])
    }
  }

  // Clear all filters
  const clearFilters = () => {
    onStatusFilterChange([])
    onSearchQueryChange('')
    setLocalSearch('')
  }

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    // Debounced search will be handled by the input onChange
    onSearchQueryChange(value)
  }

  const hasActiveFilters = statusFilter.length > 0 || searchQuery.length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by borrower name or email..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Status
              {statusFilter.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0">
                  {statusFilter.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={statusFilter.includes(option.value)}
                onCheckedChange={() => toggleStatus(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {hasActiveFilters ? (
            <span>
              Showing <span className="font-medium text-foreground">{filteredCount}</span> of{' '}
              <span className="font-medium text-foreground">{totalCount}</span> loans
            </span>
          ) : (
            <span>
              <span className="font-medium text-foreground">{totalCount}</span>{' '}
              {totalCount === 1 ? 'loan' : 'loans'} total
            </span>
          )}
        </div>

        {/* Active Filters */}
        {statusFilter.length > 0 && (
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <div className="flex gap-1">
              {statusFilter.map((status) => (
                <Badge key={status} variant="secondary" className="gap-1">
                  {STATUS_OPTIONS.find((opt) => opt.value === status)?.label}
                  <button
                    onClick={() => toggleStatus(status)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
