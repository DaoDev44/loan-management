/**
 * Manual test script for Loan Server Actions
 * Tests all CRUD operations against the database
 * Run with: npx tsx scripts/test-loan-actions.ts
 */

import { createLoan, getLoan, getLoans, updateLoan, deleteLoan } from '../app/actions/loan.actions'

async function runTests() {
  console.log('🧪 Testing Loan Server Actions\n')

  let testLoanId: string

  // Test 1: Create a new loan
  console.log('Test 1: Creating a new loan...')
  const createResult = await createLoan({
  borrowerName: 'Test Borrower',
  borrowerEmail: 'test@example.com',
  borrowerPhone: '+1-555-9999',
  principal: 15000,
  interestRate: 6.5,
  startDate: new Date('2025-01-01'),
  endDate: new Date('2026-01-01'),
  termMonths: 12,
  interestCalculationType: 'SIMPLE',
  paymentFrequency: 'MONTHLY',
  notes: 'Test loan from script',
  collateral: 'Test collateral',
})

if (createResult.success) {
  testLoanId = createResult.data.id
  console.log('✅ Loan created successfully')
  console.log(`   ID: ${testLoanId}`)
  console.log(`   Borrower: ${createResult.data.borrowerName}`)
  console.log(`   Principal: $${createResult.data.principal}`)
  console.log(`   Balance: $${createResult.data.balance}`)
  console.log(`   Status: ${createResult.data.status}\n`)
} else {
  console.error('❌ Failed to create loan:', createResult.error)
  process.exit(1)
}

// Test 2: Get single loan
console.log('Test 2: Fetching the created loan...')
const getResult = await getLoan(testLoanId)

if (getResult.success) {
  console.log('✅ Loan fetched successfully')
  console.log(`   Borrower: ${getResult.data.borrowerName}`)
  console.log(`   Email: ${getResult.data.borrowerEmail}\n`)
} else {
  console.error('❌ Failed to fetch loan:', getResult.error)
  process.exit(1)
}

// Test 3: Get all loans
console.log('Test 3: Fetching all loans...')
const getAllResult = await getLoans()

if (getAllResult.success) {
  console.log(`✅ Fetched ${getAllResult.data.length} loans`)
  console.log(`   First loan: ${getAllResult.data[0]?.borrowerName || 'N/A'}\n`)
} else {
  console.error('❌ Failed to fetch loans:', getAllResult.error)
  process.exit(1)
}

// Test 4: Filter loans
console.log('Test 4: Filtering loans by status ACTIVE...')
const filterResult = await getLoans({ status: 'ACTIVE' })

if (filterResult.success) {
  console.log(`✅ Found ${filterResult.data.length} active loans\n`)
} else {
  console.error('❌ Failed to filter loans:', filterResult.error)
  process.exit(1)
}

// Test 5: Update loan
console.log('Test 5: Updating loan notes...')
const updateResult = await updateLoan({
  id: testLoanId,
  notes: 'Updated notes from test script',
  borrowerPhone: '+1-555-8888',
})

if (updateResult.success) {
  console.log('✅ Loan updated successfully')
  console.log(`   Updated notes: ${updateResult.data.notes}`)
  console.log(`   Updated phone: ${updateResult.data.borrowerPhone}\n`)
} else {
  console.error('❌ Failed to update loan:', updateResult.error)
  process.exit(1)
}

// Test 6: Invalid data validation
console.log('Test 6: Testing validation with invalid data...')
const invalidResult = await createLoan({
  borrowerName: '',
  borrowerEmail: 'invalid-email',
  principal: -1000,
  interestRate: 150,
  startDate: new Date('2025-01-01'),
  endDate: new Date('2024-01-01'), // End before start
  termMonths: -5,
} as any)

if (!invalidResult.success) {
  console.log('✅ Validation correctly rejected invalid data')
  console.log(`   Error: ${invalidResult.error}`)
  if (invalidResult.issues) {
    console.log(`   Issues found: ${invalidResult.issues.length}\n`)
  }
} else {
  console.error('❌ Should have rejected invalid data')
  process.exit(1)
}

// Test 7: Soft delete loan
console.log('Test 7: Soft deleting the test loan...')
const deleteResult = await deleteLoan(testLoanId)

if (deleteResult.success) {
  console.log('✅ Loan soft deleted successfully\n')
} else {
  console.error('❌ Failed to delete loan:', deleteResult.error)
  process.exit(1)
}

// Test 8: Verify soft delete (should not be found)
console.log('Test 8: Verifying soft delete...')
const deletedLoanResult = await getLoan(testLoanId)

if (!deletedLoanResult.success && deletedLoanResult.error === 'Loan not found') {
  console.log('✅ Soft deleted loan correctly not found\n')
} else {
  console.error('❌ Soft deleted loan should not be retrievable')
  process.exit(1)
}

// Test 9: Search by borrower name
console.log('Test 9: Searching loans by borrower name...')
const searchResult = await getLoans({ borrowerName: 'Alice' })

if (searchResult.success) {
  console.log(`✅ Found ${searchResult.data.length} loans matching "Alice"`)
  if (searchResult.data.length > 0) {
    console.log(`   First match: ${searchResult.data[0].borrowerName}\n`)
  }
} else {
  console.error('❌ Failed to search loans:', searchResult.error)
  process.exit(1)
}

// Test 10: Filter by date range
console.log('Test 10: Filtering loans by start date range...')
const dateFilterResult = await getLoans({
  startDateFrom: new Date('2024-01-01'),
  startDateTo: new Date('2024-12-31'),
})

if (dateFilterResult.success) {
  console.log(`✅ Found ${dateFilterResult.data.length} loans in 2024\n`)
} else {
  console.error('❌ Failed to filter by date:', dateFilterResult.error)
  process.exit(1)
}

  console.log('🎉 All tests passed! Loan Server Actions are working correctly.')
  console.log('\nSummary:')
  console.log('- ✅ Create loan')
  console.log('- ✅ Get single loan')
  console.log('- ✅ Get all loans')
  console.log('- ✅ Filter loans by status')
  console.log('- ✅ Update loan')
  console.log('- ✅ Validation rejects invalid data')
  console.log('- ✅ Soft delete loan')
  console.log('- ✅ Verify soft delete')
  console.log('- ✅ Search by borrower name')
  console.log('- ✅ Filter by date range')
}

// Run the tests
runTests().catch((error) => {
  console.error('💥 Test script failed:', error)
  process.exit(1)
})
