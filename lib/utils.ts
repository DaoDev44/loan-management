import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with locale-specific formatting
 */
export function formatCurrency(
  amount: number,
  options: {
    locale?: string
    currency?: string
    compact?: boolean
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {}
): string {
  const {
    locale = 'en-US',
    currency = 'USD',
    compact = false,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options

  if (compact && amount >= 1000000) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      compactDisplay: 'short',
    }).format(amount)
  }

  if (compact && amount >= 1000) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}

/**
 * Format date with various options
 */
export function formatDate(
  date: Date | string,
  options: {
    locale?: string
    dateStyle?: 'full' | 'long' | 'medium' | 'short'
    timeStyle?: 'full' | 'long' | 'medium' | 'short'
    includeTime?: boolean
    relative?: boolean
  } = {}
): string {
  const {
    locale = 'en-US',
    dateStyle = 'medium',
    timeStyle = 'short',
    includeTime = false,
    relative = false,
  } = options

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (relative) {
    const now = new Date()
    const diffInSeconds = (now.getTime() - dateObj.getTime()) / 1000
    const diffInMinutes = diffInSeconds / 60
    const diffInHours = diffInMinutes / 60
    const diffInDays = diffInHours / 24

    if (diffInDays < 1) {
      if (diffInHours < 1) {
        if (diffInMinutes < 1) {
          return 'Just now'
        }
        return `${Math.floor(diffInMinutes)} minutes ago`
      }
      return `${Math.floor(diffInHours)} hours ago`
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} days ago`
    }
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle,
    ...(includeTime && { timeStyle }),
  }).format(dateObj)
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Format percentage with proper sign
 */
export function formatPercentage(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value}%`
}
