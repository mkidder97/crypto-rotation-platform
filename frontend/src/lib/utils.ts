import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-US', options).format(value)
}

export function getRiskColor(risk: number): string {
  if (risk <= 0.3) return 'hsl(var(--risk-low))'
  if (risk <= 0.6) return 'hsl(var(--risk-medium))'
  return 'hsl(var(--risk-high))'
}

export function getPhaseColor(phase: string): string {
  switch (phase.toLowerCase()) {
    case 'btc_heavy':
      return 'hsl(var(--phase-btc))'
    case 'eth_rotation':
      return 'hsl(var(--phase-eth))'
    case 'alt_season':
      return 'hsl(var(--phase-alt))'
    case 'cash_heavy':
      return 'hsl(var(--phase-cash))'
    default:
      return 'hsl(var(--foreground))'
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}